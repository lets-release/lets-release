import { mkdir } from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
import { temporaryDirectory } from "tempy";
import { TestProject } from "vitest/node";

import { PyPIServer } from "@lets-release/testing";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";

export default async function setup(project: TestProject) {
  const pypiServer = new PyPIServer("pypiserver-pypi", 8081);

  async function startPyPIServer() {
    await pypiServer.pull();
    await pypiServer.start();

    project.provide("pypiPublishUrl", pypiServer.url);
    project.provide("pypiToken", pypiServer.pypiToken);
    project.provide("pypiUsername", pypiServer.pypiUsername);
    project.provide("pypiPassword", pypiServer.pypiPassword);
  }

  async function stopPyPIServer() {
    await pypiServer.stop();
  }

  project.onTestsRerun(async () => {
    console.log("[@lets-release/pypi]: Restarting PyPIServer");
    await stopPyPIServer();
    await startPyPIServer();
  });

  const binDir = temporaryDirectory();
  project.provide("binDir", binDir);

  const minUvVersion = MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.uv];
  const minUvDir = path.resolve(binDir, "uv", minUvVersion);
  const maxUvDir = path.resolve(binDir, "uv", "latest");
  await mkdir(minUvDir, { recursive: true });
  await mkdir(maxUvDir, { recursive: true });

  const minPoetryVersion =
    MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.poetry];
  const minPoetryDir = path.resolve(binDir, "poetry", minPoetryVersion);
  const maxPoetryDir = path.resolve(binDir, "poetry", "latest");
  await mkdir(minPoetryDir, { recursive: true });
  await mkdir(maxPoetryDir, { recursive: true });

  if (platform() === "win32") {
    console.log(`[@lets-release/pypi]: Installing uv@${minUvVersion}`);
    await $`powershell -ExecutionPolicy ByPass -c ${`$env:UV_UNMANAGED_INSTALL = "${minUvDir}"; irm https://astral.sh/uv/${minUvVersion}/install.ps1 | iex`}`;

    console.log("[@lets-release/pypi]: Installing uv@latest");
    await $`powershell -ExecutionPolicy ByPass -c ${`$env:UV_UNMANAGED_INSTALL = "${maxUvDir}"; irm https://astral.sh/uv/install.ps1 | iex`}`;

    console.log(`[@lets-release/pypi]: Installing poetry@${minPoetryVersion}`);
    await $`powershell -ExecutionPolicy ByPass -c ${`$env:POETRY_HOME = "${minPoetryDir}"; $env:POETRY_VERSION = "${minPoetryVersion}"; (iwr -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -`}`;

    console.log("[@lets-release/pypi]: Installing poetry@latest");
    await $`powershell -ExecutionPolicy ByPass -c ${`$env:POETRY_HOME = "${maxPoetryDir}"; (iwr -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -`}`;
  } else {
    console.log(`[@lets-release/pypi]: Installing uv@${minUvVersion}`);
    await $`curl -LsSf ${`https://astral.sh/uv/${minUvVersion}/install.sh`}`
      .pipe`env ${`UV_UNMANAGED_INSTALL=${minUvDir}`} sh`;

    console.log("[@lets-release/pypi]: Installing uv@latest");
    await $`curl -LsSf https://astral.sh/uv/install.sh`
      .pipe`env ${`UV_UNMANAGED_INSTALL=${maxUvDir}`} sh`;

    console.log(`[@lets-release/pypi]: Installing poetry@${minPoetryVersion}`);
    await $`curl -sSL https://install.python-poetry.org`.pipe({
      env: {
        POETRY_HOME: minPoetryDir,
        POETRY_VERSION: minPoetryVersion,
      },
    })`python3 -`;

    console.log("[@lets-release/pypi]: Installing poetry@latest");
    await $`curl -sSL https://install.python-poetry.org`.pipe({
      env: {
        POETRY_HOME: maxPoetryDir,
      },
    })`python3 -`;
  }

  console.log("[@lets-release/pypi]: Starting PyPIServer");
  await startPyPIServer();

  return async () => {
    console.log("[@lets-release/pypi]: Stopping PyPIServer");
    await stopPyPIServer();
  };
}

declare module "vitest" {
  export interface ProvidedContext {
    pypiPublishUrl: string;
    pypiToken: string;
    pypiUsername: string;
    pypiPassword: string;
    binDir: string;
  }
}
