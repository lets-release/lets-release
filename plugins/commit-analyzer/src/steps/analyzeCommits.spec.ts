import path from "node:path";

import { Debugger, debug } from "debug";
import { ZodError } from "zod";

import {
  AnalyzeCommitsContext,
  ReleaseType,
  loadModule,
} from "@lets-release/config";
import { ConventionalChangelogPreset } from "@lets-release/conventional-changelog";

import { analyzeCommits } from "src/steps/analyzeCommits";

const invalidReleaseRulesModule = vi.hoisted(() => "invalid-release-rules");
const releaseRulesFixture = vi.hoisted(() => "src/__fixtures__/releaseRules");

vi.mock("debug", () => ({
  debug: vi.fn(),
}));
vi.mock(import("@lets-release/config"), async (importOriginal) => {
  const { loadModule, ...rest } = await importOriginal();
  const { releaseRules } = await vi.importActual(releaseRulesFixture);

  const loader = async (
    name: string,
    dirs: string[],
    cwd: string = process.cwd(),
  ) => {
    if (name === invalidReleaseRulesModule) {
      return {};
    }

    if (name === releaseRulesFixture) {
      return releaseRules;
    }

    return loadModule(name, dirs, cwd);
  };

  return {
    ...rest,
    loadModule: vi.fn().mockImplementation(loader),
  };
});

const cwd = process.cwd();
const pkgRoot = "pkgRoot";
const repositoryRoot = "repositoryRoot";
const log = vi.fn();
const logger = { log };
const pkg = { name: "test", path: pkgRoot };

vi.mocked(debug).mockReturnValue(log as unknown as Debugger);

describe("analyzeCommits", () => {
  beforeEach(() => {
    log.mockClear();
    vi.mocked(loadModule).mockClear();
  });

  it('should parse with "conventional-changelog-conventionalcommits" by default', async () => {
    const commits = [
      { hash: "123", message: "fix(scope1): First fix" },
      { hash: "456", message: "feat(scope2): Second feature" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {},
      ),
    ).resolves.toBe("minor");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.minor} release`,
    });
  });

  it('should accept "preset" option', async () => {
    const commits = [
      { hash: "123", message: "Fix: First fix (fixes #123)" },
      {
        hash: "456",
        message: "Update: Second feature (fixes #456)",
      },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        { preset: ConventionalChangelogPreset.ESLint },
      ),
    ).resolves.toBe("minor");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.minor} release`,
    });
  });

  it('should accept "config" option', async () => {
    const commits = [
      { hash: "123", message: "Fix: First fix (fixes #123)" },
      {
        hash: "456",
        message: "Update: Second feature (fixes #456)",
      },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          config: "conventional-changelog-eslint",
        },
      ),
    ).resolves.toBe("minor");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.minor} release`,
    });
  });

  it('should accept a "parseOptions" object as option', async () => {
    const commits = [
      { hash: "123", message: "%%BUGFIX%% First fix (fixes #123)" },
      {
        hash: "456",
        message: "%%FEATURE%% Second feature (fixes #456)",
      },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          parserOptions: {
            headerPattern: /^%%(?<type>.*?)%% (?<subject>.*)$/,
            headerCorrespondence: ["tag", "shortDesc"],
          },
        },
      ),
    ).resolves.toBe("minor");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.minor} release`,
    });
  });

  it('should accept a partial "parseOptions" object as option', async () => {
    const commits = [
      { hash: "123", message: "%%fix%% First fix (fixes #123)" },
      {
        hash: "456",
        message: "%%Update%% Second feature (fixes #456)",
      },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          config: "conventional-changelog-eslint",
          parserOptions: {
            headerPattern: /^%%(?<type>.*?)%% (?<subject>.*)$/,
            headerCorrespondence: ["type", "shortDesc"],
          },
        },
      ),
    ).resolves.toBe("patch");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.patch} release`,
    });
  });

  it("should exclude commits if they have a matching revert commits", async () => {
    const commits = [
      { hash: "df012f1", message: "fix(scope): First fix" },
      {
        hash: "df012f2",
        message:
          "revert: feat(scope): First feature\n\nThis reverts commit df012f3.\n",
      },
      { hash: "df012f3", message: "feat(scope): First feature" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {},
      ),
    ).resolves.toBe("patch");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${3} commits complete: ${ReleaseType.patch} release`,
    });
  });

  it('should accept a "releaseRules" option that reference a module', async () => {
    const commits = [
      { hash: "123", message: "fix(scope1): First fix" },
      { hash: "456", message: "feat(scope2): Second feature" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          releaseRules: releaseRulesFixture,
        },
      ),
    ).resolves.toBe("minor");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.minor} release`,
    });
  });

  it('should return "major" if there is a breaking change, using default releaseRules', async () => {
    const commits = [
      { hash: "123", message: "Fix: First fix (fixes #123)" },
      {
        hash: "456",
        message:
          "Update: Second feature (fixes #456) \n\n BREAKING CHANGE: break something",
      },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.ESLint,
        },
      ),
    ).resolves.toBe("major");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.major} release`,
    });
  });

  it('should return "major" if there is a "conventionalcommits" breaking change, using default releaseRules', async () => {
    const commits = [
      { hash: "123", message: "fix: First fix" },
      { hash: "456", message: "feat!: Breaking change feature" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.ConventionalCommits,
        },
      ),
    ).resolves.toBe("major");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.major} release`,
    });
  });

  it('should return "patch" if there is only types set to "patch", using default releaseRules', async () => {
    const commits = [
      { hash: "123", message: "fix: First fix (fixes #123)" },
      { hash: "456", message: "perf: perf improvement" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {},
      ),
    ).resolves.toBe("patch");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.patch} release`,
    });
  });

  it('should allow to use glob in "releaseRules" configuration', async () => {
    const commits = [
      { hash: "123", message: "Chore: First chore (fixes #123)" },
      { hash: "456", message: "Docs: update README (fixes #456)" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.ESLint,
          releaseRules: [
            { tag: "Chore", release: ReleaseType.patch },
            { message: "*README*", release: ReleaseType.minor },
          ],
        },
      ),
    ).resolves.toBe("minor");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.minor} release`,
    });
  });

  it('should return "undefined" if no rule match', async () => {
    const commits = [
      { hash: "123", message: "doc: doc update" },
      { hash: "456", message: "chore: Chore" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {},
      ),
    ).resolves.toBe(undefined);

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: no release`,
    });
  });

  it("should process rules in order and apply highest match", async () => {
    const commits = [
      { hash: "123", message: "Chore: First chore (fixes #123)" },
      { hash: "456", message: "Docs: update README (fixes #456)" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.ESLint,
          releaseRules: [
            { tag: "Chore", release: ReleaseType.minor },
            { tag: "Chore", release: ReleaseType.patch },
          ],
        },
      ),
    ).resolves.toBe("minor");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.minor} release`,
    });
  });

  it("should process rules in order and apply highest match from config even if default has an higher match", async () => {
    const commits = [
      { hash: "123", message: "Chore: First chore (fixes #123)" },
      {
        hash: "456",
        message:
          "Docs: update README (fixes #456) \n\n BREAKING CHANGE: break something",
      },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.ESLint,
          releaseRules: [
            { tag: "Chore", release: ReleaseType.patch },
            { breaking: true, release: ReleaseType.minor },
          ],
        },
      ),
    ).resolves.toBe("minor");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.minor} release`,
    });
  });

  it('should allow to overwrite default "releaseRules" with "null"', async () => {
    const commits = [
      { hash: "123", message: "chore: First chore" },
      { hash: "456", message: "feat: new feature" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.Angular,
          releaseRules: [{ type: "feat", release: null }],
        },
      ),
    ).resolves.toBe(undefined);

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${"no"} release`,
    });
  });

  it('should commits with an associated custom release type have higher priority than commits with release "null"', async () => {
    const commits = [
      { hash: "123", message: "feat: Feature to skip" },
      { hash: "456", message: "docs: update README" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.Angular,
          releaseRules: [
            { type: "feat", release: null },
            { type: "docs", release: ReleaseType.patch },
          ],
        },
      ),
    ).resolves.toBe("patch");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.patch} release`,
    });
  });

  it('should commits with an associated default release type have higher priority than commits with release "null"', async () => {
    const commits = [
      { hash: "123", message: "feat: new feature" },
      { hash: "456", message: "fix: new Fix" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.Angular,
          releaseRules: [{ type: "feat", release: null }],
        },
      ),
    ).resolves.toBe("patch");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.patch} release`,
    });
  });

  it('should use default "releaseRules" if none of provided match', async () => {
    const commits = [
      { hash: "123", message: "Chore: First chore" },
      { hash: "456", message: "Update: new feature" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.ESLint,
          releaseRules: [{ tag: "Chore", release: ReleaseType.patch }],
        },
      ),
    ).resolves.toBe("minor");

    expect(log).toHaveBeenCalledWith({
      prefix: `[${pkg.name}]`,
      message: `Analysis of ${2} commits complete: ${ReleaseType.minor} release`,
    });
  });

  it("should filter out empty commits", async () => {
    const commits = [
      { hash: "123", message: "" },
      { hash: "456", message: "fix(scope1): First fix" },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {},
      ),
    ).resolves.toBe("patch");
  });

  it('should throw error if "preset" doesn`t exist', async () => {
    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
        } as unknown as AnalyzeCommitsContext,
        { preset: "unknown-preset" } as never,
      ),
    ).rejects.toThrow(ZodError);
  });

  it('should throw error if "releaseRules" is not an Array or a String', async () => {
    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
        } as unknown as AnalyzeCommitsContext,
        { releaseRules: {} } as never,
      ),
    ).rejects.toThrow(ZodError);
  });

  it('should throw error if "releaseRules" option reference a module that is not an Array or a String', async () => {
    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
        } as unknown as AnalyzeCommitsContext,
        {
          releaseRules: invalidReleaseRulesModule,
        },
      ),
    ).rejects.toThrow(ZodError);
  });

  it('should throw error if "config" doesn`t exist', async () => {
    const commits = [
      { hash: "123", message: "Fix: First fix (fixes #123)" },
      {
        hash: "456",
        message: "Update: Second feature (fixes #456)",
      },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          config: "unknown-config",
        },
      ),
    ).rejects.toThrowError();
  });

  it('should throw error if "releaseRules" reference invalid commit type', async () => {
    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
        } as unknown as AnalyzeCommitsContext,
        {
          preset: ConventionalChangelogPreset.ESLint,
          releaseRules: [{ tag: "Update", release: "invalid" }],
        } as never,
      ),
    ).rejects.toThrow(ZodError);
  });

  it('should re-throw error from "conventional-changelog-parser"', async () => {
    const commits = [
      { hash: "123", message: "Fix: First fix (fixes #123)" },
      {
        hash: "456",
        message: "Update: Second feature (fixes #456)",
      },
    ];

    await expect(
      analyzeCommits(
        {
          cwd,
          logger,
          repositoryRoot,
          package: pkg,
          commits,
        } as unknown as AnalyzeCommitsContext,
        {
          parserOptions: { headerPattern: "\\" },
        },
      ),
    ).rejects.toThrowError();
  });
});
