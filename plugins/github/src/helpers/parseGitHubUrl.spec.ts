import { InvalidGitHubUrlError } from "src/errors/InvalidGitHubUrlError";
import { parseGitHubUrl } from "src/helpers/parseGitHubUrl";

describe("parseGitHubUrl", () => {
  it("should parse a valid HTTPS GitHub URL", () => {
    const url = "https://github.com/owner/repo.git";
    const result = parseGitHubUrl(url);

    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should parse a valid SSH GitHub URL", () => {
    const url = "git@github.com:owner/repo.git";
    const result = parseGitHubUrl(url);

    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should parse a valid SSH GitHub URL without auth", () => {
    const url = "github.com:owner/repo.git";
    const result = parseGitHubUrl(url);

    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should parse a valid GitHub URL without .git suffix", () => {
    const url = "https://github.com/owner/repo";
    const result = parseGitHubUrl(url);

    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("should throw an error for a malformed URL", () => {
    const url = "https://github.com";

    expect(() => parseGitHubUrl(url)).toThrow(InvalidGitHubUrlError);
  });

  it("should parse a valid GitHub URL with auth", () => {
    const url = "https://username:password@github.com/owner/repo.git";
    const result = parseGitHubUrl(url);
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });
});
