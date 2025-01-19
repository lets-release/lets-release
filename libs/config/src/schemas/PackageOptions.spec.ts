import { DEFAULT_SEMVER_PRERELEASE_OPTIONS } from "@lets-release/semver";

import { PackageOptions } from "src/schemas/PackageOptions";

describe("PackageOptions", () => {
  it("should validate package options", async () => {
    expect(
      PackageOptions.parse({
        paths: ["packages/*"],
      }),
    ).toEqual({
      paths: ["packages/*"],
      versioning: {
        scheme: "SemVer",
        initialVersion: "1.0.0",
        prerelease: DEFAULT_SEMVER_PRERELEASE_OPTIONS,
      },
      plugins: [
        "@lets-release/commit-analyzer",
        "@lets-release/release-notes-generator",
        "@lets-release/npm",
        "@lets-release/github",
      ],
    });
  });
});
