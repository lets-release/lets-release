import { DEFAULT_SEMVER_PRERELEASE_OPTIONS } from "@lets-release/semver";

import { Options } from "src/schemas/Options";

describe("Options", () => {
  it("should validate options", async () => {
    await expect(
      Options.parseAsync({
        packages: [
          {
            paths: ["packages/*"],
          },
        ],
      }),
    ).resolves.toEqual({
      tagFormat: "v${version}",
      refSeparator: "/",
      bumpMinorVersionCommit: {
        subject: "feat: bump ${name} to v${version}",
      },
      bumpMajorVersionCommit: {
        subject: "feat!: bump ${name} to v${version}",
      },
      branches: {
        main: "(main|master)",
        next: "next",
        nextMajor: "next-major",
        maintenance: [
          "+([0-9])?(.{+([0-9]),x}).x", // semver: N.x, N.x.x, N.N.x
          "+(+([0-9])[._-])?(x[._-])x", // calver
        ],
        prerelease: ["alpha", "beta", "rc"],
      },
      packages: [
        {
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
        },
      ],
    });
  });
});
