import { formatAuthUrl } from "src/utils/git/formatAuthUrl";

describe("formatAuthUrl", () => {
  it("should format SSH URL with credentials", () => {
    const repositoryUrl = "git@github.com:user/repo.git";
    const gitCredentials = "username:password";
    const result = formatAuthUrl(repositoryUrl, gitCredentials);
    expect(result).toBe("https://username:password@github.com/user/repo.git");
  });

  it("should format HTTP URL with credentials", () => {
    const repositoryUrl = "http://github.com/user/repo.git";
    const gitCredentials = "username:password";
    const result = formatAuthUrl(repositoryUrl, gitCredentials);
    expect(result).toBe("http://username:password@github.com/user/repo.git");
  });

  it("should format URL without credentials", () => {
    const repositoryUrl = "https://github.com/user/repo.git";
    const gitCredentials = "";
    const result = formatAuthUrl(repositoryUrl, gitCredentials);
    expect(result).toBe("https://github.com/user/repo.git");
  });

  it("should format SSH URL with protocol", () => {
    const repositoryUrl = "ssh://git@github.com/user/repo.git";
    const gitCredentials = "username:password";
    const result = formatAuthUrl(repositoryUrl, gitCredentials);
    expect(result).toBe("https://username:password@github.com/user/repo.git");
  });

  it("should format SSH URL without 'git@'", () => {
    const repositoryUrl = "github.com:user/repo.git";
    const gitCredentials = "username:password";
    const result = formatAuthUrl(repositoryUrl, gitCredentials);
    expect(result).toBe("https://username:password@github.com/user/repo.git");
  });

  it("should format URL with port specified", () => {
    const repositoryUrl = "git@github.com:2222/user/repo.git";
    const gitCredentials = "username:password";
    const result = formatAuthUrl(repositoryUrl, gitCredentials);
    expect(result).toBe(
      "https://username:password@github.com:2222/user/repo.git",
    );
  });

  it("should format URL without port specified", () => {
    const repositoryUrl = "git@github.com:user/repo.git";
    const gitCredentials = "username:password";
    const result = formatAuthUrl(repositoryUrl, gitCredentials);
    expect(result).toBe("https://username:password@github.com/user/repo.git");
  });

  it("should format URL with path and query parameters", () => {
    const repositoryUrl = "https://github.com/user/repo.git?ref=main";
    const gitCredentials = "username:password";
    const result = formatAuthUrl(repositoryUrl, gitCredentials);
    expect(result).toBe(
      "https://username:password@github.com/user/repo.git?ref=main",
    );
  });
});
