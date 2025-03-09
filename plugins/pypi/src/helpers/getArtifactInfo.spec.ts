import { PublishContext } from "@lets-release/config";

import { DEFAULT_PYPI_REGISTRY } from "src/constants/DEFAULT_PYPI_REGISTRY";
import { PYPI_ARTIFACT_NAME } from "src/constants/PYPI_ARTIFACT_NAME";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

const context = {
  package: { name: "test-package" },
  nextRelease: { version: "1.0.0" },
} as PublishContext;

describe("getArtifactInfo", () => {
  it("should return correct artifact info for default registry", () => {
    const pkgContext = {
      registry: DEFAULT_PYPI_REGISTRY,
    } as PyPIPackageContext;

    const result = getArtifactInfo(context, pkgContext);

    expect(result).toEqual({
      name: PYPI_ARTIFACT_NAME,
      url: "https://pypi.org/project/test-package/1.0.0",
    });
  });

  it("should return undefined url for non-default registry", () => {
    const pkgContext = {
      registry: { publishUrl: "https://custom-registry.com" },
    } as PyPIPackageContext;

    const result = getArtifactInfo(context, pkgContext);

    expect(result).toEqual({
      name: PYPI_ARTIFACT_NAME,
      url: undefined,
    });
  });
});
