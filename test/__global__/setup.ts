import { TestProject } from "vitest/node";

import { GitBox, Verdaccio } from "@lets-release/testing";

export default async function setup(project: TestProject) {
  const gitBox = new GitBox("git-box");
  const verdaccio = new Verdaccio("verdaccio");

  async function startGitBox() {
    await gitBox.pull();
    await gitBox.start();

    project.provide("gitBoxContainerId", gitBox.name);
    project.provide("gitBoxHost", gitBox.host);
    project.provide("gitBoxPort", gitBox.port);
    project.provide("gitCredential", gitBox.gitCredential);
  }

  async function stopGitBox() {
    await gitBox.stop();
  }

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
    console.log("[lets-release]: Restarting GitBox");
    await stopGitBox();
    await startGitBox();

    console.log("[lets-release]: Restarting Verdaccio");
    await stopVerdaccio();
    await startVerdaccio();
  });

  console.log("[lets-release]: Starting GitBox");
  await startGitBox();

  console.log("[lets-release]: Starting Verdaccio");
  await startVerdaccio();

  return async () => {
    console.log("[lets-release]: Stopping GitBox");
    await stopGitBox();

    console.log("[lets-release]: Stopping Verdaccio");
    await stopVerdaccio();
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
