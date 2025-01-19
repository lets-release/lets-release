import { uniq } from "lodash-es";

import { Artifact } from "@lets-release/config";

export function mergeArtifacts(
  artifacts: Artifact[],
  newArtifacts: Artifact[],
): Artifact[] {
  const mergedArtifacts: Artifact[] = [];

  for (const artifact of artifacts) {
    const newArtifact = newArtifacts.find(
      (newArtifact) =>
        newArtifact.pluginName === artifact.pluginName &&
        newArtifact.name === artifact.name,
    );

    if (newArtifact) {
      mergedArtifacts.push({
        ...artifact,
        url: newArtifact.url ?? artifact.url,
        channels: uniq([...artifact.channels, ...newArtifact.channels]),
      });
    } else {
      mergedArtifacts.push(artifact);
    }
  }

  return [
    ...mergedArtifacts,
    ...newArtifacts.filter(({ pluginName, name }) =>
      mergedArtifacts.every(
        (artifact) =>
          artifact.pluginName !== pluginName || artifact.name !== name,
      ),
    ),
  ];
}
