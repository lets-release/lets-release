import { mkdir } from "node:fs/promises";
import { homedir, platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
import { TestProject } from "vitest/node";

import { Verdaccio } from "@lets-release/testing";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";

export default async function setup(project: TestProject) {
  const verdaccio = new Verdaccio("verdaccio-npm", 4874);

  async function startVerdaccio() {
    await verdaccio.pull();
    await verdaccio.start();

    project.provide("registry", verdaccio.url);
    project.provide("registryHost", verdaccio.host);
    project.provide("npmToken", verdaccio.npmToken);
  }

  async function stopVerdaccio() {
    await verdaccio.stop();
  }

  project.onTestsRerun(async () => {
    console.log("[@lets-release/npm]: Restarting Verdaccio");
    await stopVerdaccio();
    await startVerdaccio();
  });

  if (platform() === "win32") {
    // https://github.com/nodejs/corepack/issues/71
    const corepackDir = path.resolve(homedir(), ".corepack");
    await mkdir(corepackDir, { recursive: true });
    await $`corepack enable ${Object.values(NpmPackageManagerName)} --install-directory ${corepackDir}`;
  } else {
    await $`corepack enable ${Object.values(NpmPackageManagerName)}`;
  }

  console.log(
    `[@lets-release/npm]: Installing pnpm@${MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.pnpm]}`,
  );
  await $`corepack install -g ${`pnpm@${MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.pnpm]}`}`;

  console.log("[@lets-release/npm]: Installing pnpm@latest");
  await $`corepack install -g pnpm@latest`;

  console.log(
    `[@lets-release/npm]: Installing yarn@${MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.yarn]}`,
  );
  await $`corepack install -g ${`yarn@${MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.yarn]}`}`;

  console.log("[@lets-release/npm]: Installing yarn@latest");
  await $`corepack install -g yarn@latest`;

  console.log(
    `[@lets-release/npm]: Installing npm@${MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.npm]}`,
  );
  await $`corepack install -g ${`npm@${MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.npm]}`}`;

  console.log("[@lets-release/npm]: Installing npm@latest");
  await $`corepack install -g npm@latest`;

  console.log("[@lets-release/npm]: Starting Verdaccio");
  await startVerdaccio();

  return async () => {
    console.log("[@lets-release/npm]: Stopping Verdaccio");
    await stopVerdaccio();
  };
}

declare module "vitest" {
  export interface ProvidedContext {
    registry: string;
    registryHost: string;
    npmToken?: string;
  }
}
