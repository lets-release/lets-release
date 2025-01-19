import { parseGitUrlPath } from "src/helpers/parseGitUrlPath";

describe("parseGitUrlPath", () => {
  it("should parse owner and repo from a valid git URL path", () => {
    const result = parseGitUrlPath("/owner/repo");
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should parse owner and repo from a valid git URL path with .git extension", () => {
    const result = parseGitUrlPath("/owner/repo.git");
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should parse owner and repo from a valid git URL path with trailing slashes", () => {
    const result = parseGitUrlPath("/owner/repo/");
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should parse owner and repo from a valid git URL path with .git extension and trailing slashes", () => {
    const result = parseGitUrlPath("/owner/repo.git/");
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should return undefined for owner and repo if the path is invalid", () => {
    const result = parseGitUrlPath("/invalidpath");
    expect(result).toEqual({ owner: undefined, repo: undefined });
  });

  it("should return undefined for owner and repo if the path is empty", () => {
    const result = parseGitUrlPath("");
    expect(result).toEqual({ owner: undefined, repo: undefined });
  });
});
