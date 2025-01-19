import { formatGitUrlWithProtocol } from "src/helpers/formatGitUrlWithProtocol";

describe("formatGitUrlWithProtocol", () => {
  it("should format URL with auth, host, port, and path", () => {
    const url = "user@host:22/path/to/repo.git";
    const formattedUrl = formatGitUrlWithProtocol(url);
    expect(formattedUrl).toBe("ssh://user@host:22/path/to/repo.git");
  });

  it("should format URL with host, port, and path", () => {
    const url = "host:22/path/to/repo.git";
    const formattedUrl = formatGitUrlWithProtocol(url);
    expect(formattedUrl).toBe("ssh://host:22/path/to/repo.git");
  });

  it("should format URL with auth, host, and path", () => {
    const url = "user@host:/path/to/repo.git";
    const formattedUrl = formatGitUrlWithProtocol(url);
    expect(formattedUrl).toBe("ssh://user@host/path/to/repo.git");
  });

  it("should format URL with host and path", () => {
    const url = "host:/path/to/repo.git";
    const formattedUrl = formatGitUrlWithProtocol(url);
    expect(formattedUrl).toBe("ssh://host/path/to/repo.git");
  });

  it("should return the original URL if it already contains a protocol", () => {
    const url = "https://host/path/to/repo.git";
    const formattedUrl = formatGitUrlWithProtocol(url);
    expect(formattedUrl).toBe(url);
  });

  it("should return the original URL if it does not match the pattern", () => {
    const url = "invalid-url";
    const formattedUrl = formatGitUrlWithProtocol(url);
    expect(formattedUrl).toBe(url);
  });
});
