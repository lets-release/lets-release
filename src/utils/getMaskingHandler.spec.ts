import { getMaskingHandler } from "src/utils/getMaskingHandler";

describe("getMaskingHandler", () => {
  it("should get masking handler", () => {
    const handler = getMaskingHandler({
      GOPRIVATE: "GoPrivate",
      GITHUB_TOKEN: "GithubToken",
      GITHUB_PASSWORD: "GithubPassword",
      GITHUB_CREDENTIAL: "GithubCredential",
      GITHUB_SECRET: "GithubSecret",
      GITHUB_PRIVATE: "GithubPrivate",
      GITLAB_TOKEN: "glab",
    });

    expect(handler("GoPrivate")).toBe("GoPrivate");
    expect(handler("GithubToken")).toBe("[secure]");
    expect(handler("GithubPassword")).toBe("[secure]");
    expect(handler("GithubCredential")).toBe("[secure]");
    expect(handler("GithubSecret")).toBe("[secure]");
    expect(handler("GithubPrivate")).toBe("[secure]");
    expect(handler("glab")).toBe("glab");
    expect(handler({ test: "test" })).toEqual({ test: "test" });
  });
});
