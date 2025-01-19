import { ArtifactInfo, PartialRequired } from "@lets-release/config";

export function getArtifactMarkdown({
  name,
  url,
}: PartialRequired<ArtifactInfo, "name">) {
  return url
    ? url.startsWith("http")
      ? `[${name}](${url})`
      : `${name}: \`${url}\``
    : `\`${name}\``;
}
