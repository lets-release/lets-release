export function formatGitUrlWithProtocol(url: string) {
  const [match, auth, host, port, path] =
    /^(?!.+:\/\/)(?:(?<auth>.*)@)?(?<host>.*?):(?<port>\d+)?:?\/?(?<path>.*)$/.exec(
      url,
    ) ?? [];

  return match
    ? `ssh://${auth ? `${auth}@` : ""}${host}${port ? `:${port}` : ""}/${path}`
    : url;
}
