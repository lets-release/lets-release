import { normalizeGitUrl } from "src/helpers/normalizeGitUrl";

describe("normalizeGitUrl", () => {
  it("should expand shorthand URLs", () => {
    const url = "owner/repo";
    const result = normalizeGitUrl(url);
    expect(result).toBe("https://github.com/owner/repo.git");
  });

  it("should replace git+https with https", () => {
    const url = "git+https://github.com/owner/repo";
    const result = normalizeGitUrl(url);
    expect(result).toBe("https://github.com/owner/repo");
  });

  it("should replace git+http with http", () => {
    const url = "git+http://github.com/owner/repo";
    const result = normalizeGitUrl(url);
    expect(result).toBe("http://github.com/owner/repo");
  });

  it("should return the original URL if no changes are needed", () => {
    const url = "https://github.com/owner/repo";
    const result = normalizeGitUrl(url);
    expect(result).toBe(url);
  });

  it("should handle URLs with no protocol", () => {
    const url = "github.com/owner/repo";
    const result = normalizeGitUrl(url);
    expect(result).toBe(url);
  });
});
