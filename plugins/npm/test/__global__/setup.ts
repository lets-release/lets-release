import { homedir, platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
import { mkdir } from "fs-extra";
import { TestProject } from "vitest/node";

import { Verdaccio } from "@lets-release/testing";

export default async function setup(project: TestProject) {
  console.log("[@lets-release/npm]: Starting services...");

  const verdaccio = new Verdaccio("verdaccio-npm", 4874);

  async function start() {
    await verdaccio.pull();
    await verdaccio.start();

    if (platform() === "win32") {
      // https://github.com/nodejs/corepack/issues/71
      const corepackDir = path.resolve(homedir(), ".corepack");
      await mkdir(corepackDir, { recursive: true });
      await $`corepack enable --install-directory ${corepackDir}`;
    } else {
      await $`corepack enable`;
    }

    await $`corepack install -g pnpm@latest`;
    await $`corepack install -g yarn@latest`;

    project.provide("registry", verdaccio.url);
    project.provide("registryHost", verdaccio.host);
    project.provide("npmToken", verdaccio.npmToken);
  }

  async function stop() {
    await verdaccio.stop();
  }

  project.onTestsRerun(async () => {
    console.log("[@lets-release/npm]: Restarting services...");

    await stop();
    await start();
  });

  await start();

  return async () => {
    console.log("[@lets-release/npm]: Stopping services...");

    await stop();
  };
}

declare module "vitest" {
  export interface ProvidedContext {
    registry: string;
    registryHost: string;
    npmToken?: string;
  }
}
