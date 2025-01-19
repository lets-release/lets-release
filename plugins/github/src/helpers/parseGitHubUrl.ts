import { parseGitUrl } from "@lets-release/config";

import { InvalidGitHubUrlError } from "src/errors/InvalidGitHubUrlError";

export function parseGitHubUrl(url: string) {
  const { owner, repo } = parseGitUrl(url);

  if (!owner || !repo) {
    throw new InvalidGitHubUrlError();
  }

  return {
    owner,
    repo,
  };
}
