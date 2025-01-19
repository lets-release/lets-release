export function parseGitUrlPath(pathname: string) {
  const [, owner, repo] =
    /^\/(?<owner>.+)\/(?<repo>[^/]+?)(?:\.git)?$/.exec(
      pathname.replace(/\/*$/, ""),
    ) ?? [];

  return { owner, repo };
}
