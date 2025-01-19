import { normalizeGitUrl, parseGitUrl } from "@lets-release/config";

export function getGitHostUrl(url: string, defaultProtocol = "https:") {
  const { protocol, host } = parseGitUrl(normalizeGitUrl(url));

  return `${/^https?:$/.test(protocol) ? protocol : defaultProtocol}//${host}`;
}
