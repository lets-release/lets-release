export function getUrlProtocol(url: string) {
  const [, protocol] = /^(.+:)\/\//.exec(url) ?? [];

  return protocol;
}
