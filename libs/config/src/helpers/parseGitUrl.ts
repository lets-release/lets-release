import { formatGitUrlWithProtocol } from "src/helpers/formatGitUrlWithProtocol";
import { parseGitUrlPath } from "src/helpers/parseGitUrlPath";

export function parseGitUrl(url: string): Pick<
  URL,
  | "hash"
  | "host"
  | "hostname"
  | "href"
  | "origin"
  | "password"
  | "pathname"
  | "port"
  | "protocol"
  | "search"
  | "username"
> & {
  owner?: string;
  repo?: string;
} {
  const {
    hash,
    host,
    hostname,
    href,
    origin,
    password,
    pathname,
    port,
    protocol,
    search,
    username,
  } = new URL(formatGitUrlWithProtocol(url));
  const { owner, repo } = parseGitUrlPath(pathname);

  return {
    hash,
    host,
    hostname,
    href,
    origin,
    password,
    pathname,
    port,
    protocol,
    search,
    username,
    owner,
    repo,
  };
}
