import { BaseContext } from "@lets-release/config";

import { resolveGitHubOptions } from "src/helpers/resolveGitHubOptions";
import { GitHubOptions } from "src/schemas/GitHubOptions";

const parseAsync = vi.spyOn(GitHubOptions, "parseAsync");

const repositoryUrl = "https://github.com/lets-release/lets-release.git";

describe("resolveGitHubOptions", () => {
  beforeEach(() => {
    parseAsync
      .mockReset()
      .mockResolvedValue(
        {} as Awaited<ReturnType<typeof GitHubOptions.parseAsync>>,
      );
  });

  it("should resolve GitHub options with environment variables", async () => {
    const env = {
      GITHUB_TOKEN: "gh_token",
      GITHUB_API_URL: "https://api.github.com",
    };

    const result = await resolveGitHubOptions(
      { env, options: { repositoryUrl } } as unknown as BaseContext,
      {},
    );

    expect(result).toEqual({
      token: "gh_token",
      url: "https://github.com",
      apiUrl: "https://api.github.com",
      proxy: false,
    });
  });

  it("should resolve GitHub options with provided options", async () => {
    parseAsync.mockResolvedValue({
      url: "https://custom.github.com",
      apiUrl: "https://custom.api.github.com",
      proxy: "http://custom.proxy.com",
    } as Awaited<ReturnType<typeof GitHubOptions.parseAsync>>);

    const result = await resolveGitHubOptions(
      { env: {}, options: { repositoryUrl } } as unknown as BaseContext,
      {},
    );

    expect(result).toEqual({
      token: undefined,
      url: "https://custom.github.com",
      apiUrl: "https://custom.api.github.com",
      proxy: "http://custom.proxy.com",
    });
  });

  it("should prioritize provided options over environment variables", async () => {
    parseAsync.mockResolvedValue({
      apiUrl: "https://custom.api.github.com",
      proxy: "http://custom.proxy.com",
    } as Awaited<ReturnType<typeof GitHubOptions.parseAsync>>);

    const env = {
      GITHUB_TOKEN: "gh_token",
      GITHUB_API_URL: "https://api.github.com",
      http_proxy: "http://proxy.com",
    };

    const result = await resolveGitHubOptions(
      { env, options: { repositoryUrl } } as unknown as BaseContext,
      {},
    );

    expect(result).toEqual({
      token: "gh_token",
      url: "https://github.com",
      apiUrl: "https://custom.api.github.com",
      proxy: "http://custom.proxy.com",
    });
  });
});
