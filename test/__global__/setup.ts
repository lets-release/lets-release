import { TestProject } from "vitest/node";

import { GitBox, Verdaccio } from "@lets-release/testing";

export default async function setup(project: TestProject) {
  console.log("[lets-release]: Starting services...");

  const gitBox = new GitBox("git-box");
  const verdaccio = new Verdaccio("verdaccio");

  async function start() {
    await gitBox.pull();
    await verdaccio.pull();
    await gitBox.start();
    await verdaccio.start();

    project.provide("gitBoxContainerId", gitBox.name);
    project.provide("gitBoxHost", gitBox.host);
    project.provide("gitBoxPort", gitBox.port);
    project.provide("gitCredential", gitBox.gitCredential);
    project.provide("registry", verdaccio.url);
    project.provide("registryHost", verdaccio.host);
    project.provide("npmToken", verdaccio.npmToken);
  }

  async function stop() {
    await gitBox.stop();
    await verdaccio.stop();
  }

  project.onTestsRerun(async () => {
    console.log("[lets-release]: Restarting services...");

    await stop();
    await start();
  });

  await start();

  return async () => {
    console.log("[lets-release]: Stopping services...");

    await stop();
  };
}

declare module "vitest" {
  export interface ProvidedContext {
    gitBoxContainerId: string;
    gitBoxHost: string;
    gitBoxPort: number;
    gitCredential: string;
    registry: string;
    registryHost: string;
    npmToken?: string;
  }
}
