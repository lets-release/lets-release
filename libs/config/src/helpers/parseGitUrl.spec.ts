import { parseGitUrl } from "src/helpers/parseGitUrl";

describe("parseGitUrl", () => {
  it("should parse a git URL correctly", () => {
    const url = "https://github.com/user/repo.git";
    const result = parseGitUrl(url);
    expect(result).toEqual({
      hash: "",
      host: "github.com",
      hostname: "github.com",
      href: "https://github.com/user/repo.git",
      origin: "https://github.com",
      password: "",
      pathname: "/user/repo.git",
      port: "",
      protocol: "https:",
      search: "",
      username: "",
      owner: "user",
      repo: "repo",
    });
  });

  it("should parse a git URL without .git suffix correctly", () => {
    const url = "https://github.com/user/repo";
    const result = parseGitUrl(url);
    expect(result).toEqual({
      hash: "",
      host: "github.com",
      hostname: "github.com",
      href: "https://github.com/user/repo",
      origin: "https://github.com",
      password: "",
      pathname: "/user/repo",
      port: "",
      protocol: "https:",
      search: "",
      username: "",
      owner: "user",
      repo: "repo",
    });
  });

  it("should parse a git URL with a subpath correctly", () => {
    const url = "https://github.com/user/repo/tree/main";
    const result = parseGitUrl(url);
    expect(result).toEqual({
      hash: "",
      host: "github.com",
      hostname: "github.com",
      href: "https://github.com/user/repo/tree/main",
      origin: "https://github.com",
      password: "",
      pathname: "/user/repo/tree/main",
      port: "",
      protocol: "https:",
      search: "",
      username: "",
      owner: "user/repo/tree",
      repo: "main",
    });
  });

  it("should parse a git URL with a hash correctly", () => {
    const url = "https://github.com/user/repo.git#readme";
    const result = parseGitUrl(url);
    expect(result).toEqual({
      hash: "#readme",
      host: "github.com",
      hostname: "github.com",
      href: "https://github.com/user/repo.git#readme",
      origin: "https://github.com",
      password: "",
      pathname: "/user/repo.git",
      port: "",
      protocol: "https:",
      search: "",
      username: "",
      owner: "user",
      repo: "repo",
    });
  });

  it("should parse a git URL with a search query correctly", () => {
    const url = "https://github.com/user/repo.git?tab=readme";
    const result = parseGitUrl(url);
    expect(result).toEqual({
      hash: "",
      host: "github.com",
      hostname: "github.com",
      href: "https://github.com/user/repo.git?tab=readme",
      origin: "https://github.com",
      password: "",
      pathname: "/user/repo.git",
      port: "",
      protocol: "https:",
      search: "?tab=readme",
      username: "",
      owner: "user",
      repo: "repo",
    });
  });

  it("should parse invalid git url", () => {
    const url = "https://github.com/user";
    const result = parseGitUrl(url);
    expect(result).toEqual({
      hash: "",
      host: "github.com",
      hostname: "github.com",
      href: "https://github.com/user",
      origin: "https://github.com",
      password: "",
      pathname: "/user",
      port: "",
      protocol: "https:",
      search: "",
      username: "",
      owner: undefined,
      repo: undefined,
    });
  });
});
