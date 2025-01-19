import {
  BranchType,
  NormalizedNextRelease,
  VersioningScheme,
} from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { getBuildMetadata } from "src/utils/branch/getBuildMetadata";
import { denormalizeNextRelease } from "src/utils/plugin/denormalizeNextRelease";

vi.mock("src/utils/branch/getBuildMetadata");

const buildMetadata = "build-metadata";

vi.mocked(getBuildMetadata).mockReturnValue(buildMetadata);

describe("denormalizeNextRelease", () => {
  it("should return undefined if no branch provided", () => {
    expect(
      denormalizeNextRelease({} as NormalizedStepContext, "test-plugin"),
    ).toBeUndefined();
  });

  it("should return undefined if no package provided", () => {
    expect(
      denormalizeNextRelease(
        { branch: {} } as unknown as NormalizedStepContext,
        "test-plugin",
      ),
    ).toBeUndefined();
  });

  it("should return undefined if normalized historical release is not provided", () => {
    expect(
      denormalizeNextRelease(
        { branch: {}, package: {} } as unknown as NormalizedStepContext,
        "test-plugin",
      ),
    ).toBeUndefined();
  });

  it("should return denormalized release with plugin channels", () => {
    expect(
      denormalizeNextRelease(
        {
          branch: { type: BranchType.prerelease },
          package: {
            versioning: {
              scheme: VersioningScheme.SemVer,
              prerelease: {},
            },
          },
        } as unknown as NormalizedStepContext,
        "test-plugin",
        {
          version: "1.0.0",
          channels: { default: ["stable"] },
          hash: "abc123",
        } as unknown as NormalizedNextRelease,
      ),
    ).toEqual(expect.objectContaining({ channels: ["stable"] }));
  });

  it("should update build metadata if updateBuild is true", () => {
    // semver
    expect(
      denormalizeNextRelease(
        {
          branch: { type: BranchType.main },
          package: {
            versioning: {
              scheme: VersioningScheme.SemVer,
              prerelease: {},
              build: true,
            },
          },
        } as unknown as NormalizedStepContext,
        "test-plugin",
        {
          version: "1.0.0+former-build",
          channels: { default: ["stable"] },
          hash: "abc123",
        } as unknown as NormalizedNextRelease,
        { updateBuild: true },
      ),
    ).toEqual(
      expect.objectContaining({
        version: "1.0.0+build-metadata",
      }),
    );

    // calver
    expect(
      denormalizeNextRelease(
        {
          branch: { type: BranchType.main },
          package: {
            versioning: {
              scheme: VersioningScheme.CalVer,
              format: "YYYY.0M.0D",
              prerelease: {},
              build: true,
            },
          },
        } as unknown as NormalizedStepContext,
        "test-plugin",
        {
          version: "2024.01.01+former-build",
          channels: { default: ["stable"] },
          hash: "abc123",
        } as unknown as NormalizedNextRelease,
        { updateBuild: true },
      ),
    ).toEqual(
      expect.objectContaining({
        version: "2024.01.01+build-metadata",
      }),
    );
  });

  it("should format version using CalVer if scheme is CalVer", () => {
    expect(
      denormalizeNextRelease(
        {
          branch: { type: BranchType.main },
          package: {
            versioning: {
              scheme: VersioningScheme.CalVer,
              format: "YYYY.0M.0D",
              prerelease: {},
            },
          },
        } as unknown as NormalizedStepContext,
        "test-plugin",
        {
          version: "2024.01.01",
          channels: { default: ["stable"] },
          hash: "abc123",
        } as unknown as NormalizedNextRelease,
      ),
    ).toEqual(
      expect.objectContaining({
        version: "2024.01.01",
      }),
    );
  });

  it("should format version using SemVer if scheme is SemVer", () => {
    expect(
      denormalizeNextRelease(
        {
          branch: { type: BranchType.main },
          package: {
            versioning: {
              scheme: VersioningScheme.SemVer,
              prerelease: {},
            },
          },
        } as unknown as NormalizedStepContext,
        "test-plugin",
        {
          version: "3.0.0",
          channels: { default: ["stable"] },
          hash: "abc123",
        } as unknown as NormalizedNextRelease,
      ),
    ).toEqual(
      expect.objectContaining({
        version: "3.0.0",
      }),
    );
  });
});
