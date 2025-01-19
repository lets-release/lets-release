import { BaseContext } from "@lets-release/config";

import { InvalidGitLabUrlError } from "src/errors/InvalidGitLabUrlError";
import { parseGitLabUrl } from "src/helpers/parseGitLabUrl";

describe("parseGitLabUrl", () => {
  it("should parse owner and repo from CI_PROJECT_PATH", () => {
    const context = {
      env: { CI_PROJECT_PATH: "owner/repo" },
      options: { repositoryUrl: "" },
    } as unknown as BaseContext;
    const options = { url: "https://gitlab.com" };

    const result = parseGitLabUrl(context, options);

    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should parse owner and repo from repositoryUrl", () => {
    const context = {
      env: { CI_PROJECT_PATH: "" },
      options: { repositoryUrl: "https://gitlab.com/owner/repo" },
    } as unknown as BaseContext;
    const options = { url: "https://gitlab.com" };

    const result = parseGitLabUrl(context, options);

    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should throw InvalidGitLabUrlError if owner or repo is missing", () => {
    const context = {
      env: { CI_PROJECT_PATH: "" },
      options: { repositoryUrl: "https://gitlab.com/invalid" },
    } as unknown as BaseContext;
    const options = { url: "https://gitlab.com" };

    expect(() => parseGitLabUrl(context, options)).toThrow(
      InvalidGitLabUrlError,
    );
  });

  it("should handle custom url", () => {
    const context = {
      env: { CI_PROJECT_PATH: "" },
      options: { repositoryUrl: "https://custom.gitlab.com/owner/repo" },
    } as unknown as BaseContext;
    const options = { url: "https://custom.gitlab.com" };

    const result = parseGitLabUrl(context, options);

    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });
});
