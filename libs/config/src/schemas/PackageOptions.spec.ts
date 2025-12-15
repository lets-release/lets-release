import { DEFAULT_VERSIONING_PRERELEASE_OPTIONS } from "@lets-release/versioning";

import { PackageOptions } from "src/schemas/PackageOptions";

describe("PackageOptions", () => {
  it("should validate package options", () => {
    expect(
      PackageOptions.parse({
        paths: ["packages/*"],
      }),
    ).toEqual({
      paths: ["packages/*"],
      versioning: {
        scheme: "SemVer",
        initialVersion: "1.0.0",
        prerelease: DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
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
