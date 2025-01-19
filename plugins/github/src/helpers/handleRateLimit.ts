import { Octokit } from "@octokit/core";
import { EndpointDefaults } from "@octokit/types";

import { OCTOKIT_MAX_RETRIES } from "src/constants/OCTOKIT_MAX_RETRIES";

export function handleRateLimit(
  retryAfter: number,
  options: Required<EndpointDefaults>,
  octokit: Octokit,
  retryCount: number,
) {
  octokit.log.warn(
    `Request quota exhausted for request ${options.method} ${options.url}`,
  );

  if (retryCount <= OCTOKIT_MAX_RETRIES) {
    octokit.log.debug(`Retrying after ${retryAfter} seconds!`);

    return true;
  }
}
