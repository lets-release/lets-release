import pRetry from "p-retry";
import { inject } from "vitest";

import { createRepo } from "@lets-release/testing";

import { cloneRepo } from "test/__helpers__/git/cloneRepo";

const gitBoxContainerId = inject("gitBoxContainerId");
const gitBoxHost = inject("gitBoxHost");
const gitBoxPort = inject("gitBoxPort");
const gitCredential = inject("gitCredential");

export async function createAndCloneRepo(name: string) {
  const { url, authUrl } = await createRepo(
    gitBoxContainerId,
    gitBoxHost,
    gitBoxPort,
    gitCredential,
    name,
  );

  const cwd = await pRetry(async () => await cloneRepo(authUrl, undefined, 1), {
    retries: 5,
    minTimeout: 500,
    factor: 2,
  });

  return { url, authUrl, cwd };
}
