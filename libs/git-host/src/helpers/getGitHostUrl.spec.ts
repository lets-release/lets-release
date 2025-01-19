import { getGitHostUrl } from "src/helpers/getGitHostUrl";

describe("getGitHostUrl", () => {
  it("should return the correct URL with https protocol", () => {
    const url = "https://github.com/user/repo";
    const result = getGitHostUrl(url);
    expect(result).toBe("https://github.com");
  });

  it("should return the correct URL with http protocol", () => {
    const url = "http://github.com/user/repo";
    const result = getGitHostUrl(url);
    expect(result).toBe("http://github.com");
  });

  it("should return the correct URL with default protocol when protocol is invalid", () => {
    const url = "ftp://github.com/user/repo";
    const result = getGitHostUrl(url);
    expect(result).toBe("https://github.com");
  });

  it("should return the correct URL with custom default protocol when protocol is invalid", () => {
    const url = "ftp://github.com/user/repo";
    const result = getGitHostUrl(url, "http:");
    expect(result).toBe("http://github.com");
  });
});
