import hostedGitInfo from "hosted-git-info";

import { getUrlProtocol } from "src/helpers/getUrlProtocol";

// eslint-disable-next-line import-x/no-named-as-default-member
const { fromUrl } = hostedGitInfo;

export function normalizeGitUrl(url: string) {
  const info = fromUrl(url, { noGitPlus: true });
  const protocol = getUrlProtocol(url);

  if (info && info.getDefaultRepresentation() === "shortcut") {
    // Expand shorthand URLs (such as `owner/repo` or `gitlab:owner/repo`)
    return info.https();
  } else if (protocol && protocol.includes("http")) {
    // Replace `git+https` and `git+http` with `https` or `http`
    return url.replace(
      protocol,
      protocol.includes("https") ? "https:" : "http:",
    );
  } else {
    return url;
  }
}
