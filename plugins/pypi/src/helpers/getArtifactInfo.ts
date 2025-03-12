import normalizeUrl from "normalize-url";

import { PublishContext } from "@lets-release/config";

import { DEFAULT_PYPI_REGISTRY } from "src/constants/DEFAULT_PYPI_REGISTRY";
import { PYPI_ARTIFACT_NAME } from "src/constants/PYPI_ARTIFACT_NAME";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

export function getArtifactInfo(
  { package: { name }, nextRelease: { version } }: PublishContext,
  { registry }: PyPIPackageContext,
) {
  return {
    name: PYPI_ARTIFACT_NAME,
    url:
      normalizeUrl(registry.publishUrl) ===
      normalizeUrl(DEFAULT_PYPI_REGISTRY.publishUrl)
        ? `https://pypi.org/project/${name}/${version}`
        : undefined,
  };
}
