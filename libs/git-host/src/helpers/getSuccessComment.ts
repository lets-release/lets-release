import {
  ArtifactInfo,
  NextRelease,
  PartialRequired,
} from "@lets-release/config";
import { getArtifactMarkdown } from "@lets-release/git-host";

export function getSuccessComment(
  type: string,
  nextRelease: NextRelease,
  artifacts?: PartialRequired<ArtifactInfo, "name">[],
) {
  return `:tada: This ${
    type === "issue" ? "issue has been resolved" : `${type} is included`
  } in version ${nextRelease.version} :tada:${
    artifacts?.length
      ? `\n\nThe release is available on${
          artifacts.length === 1
            ? ` ${getArtifactMarkdown(artifacts[0])}`
            : `:\n${artifacts
                .map((artifact) => `- ${getArtifactMarkdown(artifact)}`)
                .join("\n")}`
        }`
      : ""
  }

Your **[lets-release][]** bot :package::rocket:

[lets-release]: https://github.com/lets-release/lets-release`;
}
