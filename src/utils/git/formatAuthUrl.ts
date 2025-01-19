import { format } from "node:url";

import { getUrlProtocol, parseGitUrl } from "@lets-release/config";

/**
 * Machinery to format a repository URL with the given credentials
 *
 * @param repositoryUrl User-given repository URL
 * @param gitCredentials The basic auth part of the URL
 *
 * @return The formatted Git repository URL.
 */
export function formatAuthUrl(repositoryUrl: string, gitCredentials: string) {
  const protocol = getUrlProtocol(repositoryUrl);
  const { hostname, port, pathname, search, hash, href } =
    parseGitUrl(repositoryUrl);

  return format({
    pathname,
    search,
    hash,
    href,
    auth: gitCredentials,
    host: `${hostname}${protocol === "ssh:" ? "" : port ? `:${port}` : ""}`,
    protocol: protocol && /http[^s]/.test(protocol) ? "http" : "https",
  });
}
