import normalizeUrl from "normalize-url";

import { PublishContext } from "@lets-release/config";

import { DEFAULT_NPM_REGISTRY } from "src/constants/DEFAULT_NPM_REGISTRY";
import { NPM_ARTIFACT_NAME } from "src/constants/NPM_ARTIFACT_NAME";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export function getArtifactInfo(
  { package: { name }, nextRelease: { version } }: PublishContext,
  { registry }: NpmPackageContext,
) {
  return {
    name: NPM_ARTIFACT_NAME,
    url:
      normalizeUrl(registry) === normalizeUrl(DEFAULT_NPM_REGISTRY)
        ? `https://www.npmjs.com/package/${name}/v/${version}`
        : undefined,
  };
}
