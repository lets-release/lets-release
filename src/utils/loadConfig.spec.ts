import { PublicExplorer, cosmiconfig } from "cosmiconfig";
import { ZodError } from "zod";

import { DEFAULT_VERSIONING_PRERELEASE_OPTIONS } from "@lets-release/versioning";

import { getRemoteUrl } from "src/utils/git/getRemoteUrl";
import { loadConfig } from "src/utils/loadConfig";

vi.mock("cosmiconfig");
vi.mock("src/utils/getRepoUrl");
vi.mock("src/utils/git/getRemoteUrl");

const env = {};
const repositoryRoot = process.cwd();
const repositoryUrl = "https://github.com/lets-release/lets-release.git";
const search = vi.fn();

vi.mocked(getRemoteUrl).mockResolvedValue(repositoryUrl);
vi.mocked(cosmiconfig).mockReturnValue({ search } as unknown as PublicExplorer);

describe("loadConfig", () => {
  beforeEach(() => {
    vi.mocked(search).mockReset();
  });

  it("should throw error if options is invalid", async () => {
    await expect(loadConfig({}, { env, repositoryRoot })).rejects.toThrow(
      ZodError,
    );
  });

  it("should load config", async () => {
    vi.mocked(search).mockResolvedValue({
      config: {
        debug: undefined,
        packages: [
          {
            paths: ["./"],
          },
        ],
      },
      filePath: "release.config.ts",
    });

    await expect(
      loadConfig(
        { dryRun: true, releaseCommit: undefined },
        { env, repositoryRoot },
      ),
    ).resolves.toEqual({
      dryRun: true,
      repositoryUrl,
      tagFormat: "v${version}",
      refSeparator: "/",
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
      bumpMajorVersionCommit: {
        subject: "feat!: bump ${name} to v${version}",
      },
      bumpMinorVersionCommit: {
        subject: "feat: bump ${name} to v${version}",
      },
      packages: [
        {
          paths: ["./"],
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
        },
      ],
    });
  });
});
