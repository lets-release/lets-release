import { PublishContext } from "@lets-release/config";

import { DEFAULT_NPM_REGISTRY } from "src/constants/DEFAULT_NPM_REGISTRY";
import { NPM_ARTIFACT_NAME } from "src/constants/NPM_ARTIFACT_NAME";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const context = {
  env: { DEFAULT_NPM_REGISTRY: undefined },
  package: { name: "test" },
  nextRelease: { version: "1.0.0" },
} as unknown as PublishContext;

describe("getArtifactInfo", () => {
  it("should get artifact info with url for default registry", () => {
    expect(
      getArtifactInfo(context, {
        registry: DEFAULT_NPM_REGISTRY,
      } as NpmPackageContext),
    ).toEqual({
      name: NPM_ARTIFACT_NAME,
      url: "https://www.npmjs.com/package/test/v/1.0.0",
    });
  });

  it("should get artifact info without url for other registry", () => {
    expect(
      getArtifactInfo(context, {
        registry: "https://test.org/",
      } as NpmPackageContext),
    ).toEqual({
      name: NPM_ARTIFACT_NAME,
      url: undefined,
    });
  });
});
