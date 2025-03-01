import path from "node:path";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import conventionalChangelogEslint from "conventional-changelog-eslint";
import { writeChangelogStream } from "conventional-changelog-writer";
import { outputJson } from "fs-extra";
import { escapeRegExp } from "lodash-es";
import { temporaryDirectory } from "tempy";
import { ZodError } from "zod";

import { GenerateNotesContext } from "@lets-release/config";
import { ConventionalChangelogPreset } from "@lets-release/conventional-changelog";

import { generateNotes } from "src/steps/generateNotes";

vi.mock("conventional-changelog-writer", { spy: true });

const cwd = path.resolve(import.meta.dirname, "../../");
const host = "https://github.com";
const owner = "owner";
const repository = "repo";
const repositoryUrl = `${host}/${owner}/${repository}`;
const pkg = {
  path: cwd,
  uniqueName: "npm/pkg",
};
const repositoryRoot = process.cwd();
const lastRelease = { tag: "v1.0.0" };
const nextRelease = { tag: "v2.0.0", version: "2.0.0" };

describe("generateNotes", () => {
  beforeEach(() => {
    vi.mocked(writeChangelogStream).mockClear();
  });

  it('should use "conventional-changelog-conventionalcommits" by default', async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111))",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](https://github.com/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it("should set conventional-changelog-writer context", async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      path: cwd,
      uniqueName: "npm/pkg",
    };
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(vi.mocked(writeChangelogStream)).toHaveBeenCalledWith(
      {
        version: nextRelease.version,
        host,
        owner,
        repository,
        previousTag: lastRelease.tag,
        currentTag: nextRelease.tag,
        linkCompare: !!nextRelease.tag && !!lastRelease.tag,
        issue: "issues",
        commit: "commit",
        packageData: undefined,
        linkReferences: true,
      },
      expect.any(Object),
    );
  });

  it("should set conventional-changelog-writer context with package.json", async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      path: cwd,
      uniqueName: "npm/pkg",
    };
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const packageData = { name: "package", version: "0.0.0" };
    await outputJson(path.resolve(cwd, "package.json"), packageData);
    await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(vi.mocked(writeChangelogStream)).toHaveBeenCalledWith(
      {
        version: nextRelease.version,
        host,
        owner,
        repository,
        previousTag: lastRelease.tag,
        currentTag: nextRelease.tag,
        linkCompare: !!nextRelease.tag && !!lastRelease.tag,
        issue: "issues",
        commit: "commit",
        packageData,
        linkReferences: true,
      },
      expect.any(Object),
    );
  });

  it('should accept a "preset" option', async () => {
    const commits = [
      { hash: "111", message: "Fix: First fix (fixes #123)" },
      { hash: "222", message: "Update: Second feature (fixes #456)" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      { preset: ConventionalChangelogPreset.ESLint },
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Fix/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* First fix (fixes #123) ([111](https://github.com/owner/repo/commit/111)), closes [#123](https://github.com/owner/repo/issues/123)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Update/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* Second feature (fixes #456) ([222](https://github.com/owner/repo/commit/222)), closes [#456](https://github.com/owner/repo/issues/456)",
        ),
      ),
    );
  });

  it('should accept a "config" option', async () => {
    const commits = [
      { hash: "111", message: "Fix: First fix (fixes #123)" },
      { hash: "222", message: "Update: Second feature (fixes #456)" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      { config: "conventional-changelog-eslint" },
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Fix/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* First fix (fixes #123) ([111](https://github.com/owner/repo/commit/111)), closes [#123](https://github.com/owner/repo/issues/123)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Update/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* Second feature (fixes #456) ([222](https://github.com/owner/repo/commit/222)), closes [#456](https://github.com/owner/repo/issues/456)",
        ),
      ),
    );
  });

  it('should accept a "parseOptions" and "writerOptions" objects as option', async () => {
    const commits = [
      { hash: "111", message: "%%Fix%% First fix (keyword #123)" },
      {
        hash: "222",
        message: "%%Update%% Second feature (keyword JIRA-456)",
      },
    ];
    const { writer } = await conventionalChangelogEslint();
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {
        parserOptions: {
          headerPattern: /^%%(?<tag>.*?)%% (?<message>.*)$/,
          headerCorrespondence: ["tag", "message"],
          referenceActions: ["keyword"],
          issuePrefixes: ["#", "JIRA-"],
        },
        writerOptions: writer,
      },
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Fix/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* First fix (keyword #123) ([111](https://github.com/owner/repo/commit/111)), closes [#123](https://github.com/owner/repo/issues/123)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Update/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* Second feature (keyword JIRA-456) ([222](https://github.com/owner/repo/commit/222)), closes [#456](https://github.com/owner/repo/issues/456)",
        ),
      ),
    );
  });

  it('should accept a partial "parseOptions" and "writerOptions" objects as option', async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): 2 First fix (fixes #123)" },
      { hash: "222", message: "fix(scope2): 1 Second fix (fixes #456)" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot: path.resolve(import.meta.dirname, "../../"),
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {
        preset: ConventionalChangelogPreset.Angular,
        parserOptions: {
          headerPattern: /^(?<type>\w*)\((?<scope>.*)\): (?<subject>.*)$/,
        },
        writerOptions: { commitsSort: ["subject", "scope"] },
      },
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      /\* \*\*scope2:\*\* 1 Second fix[\S\s]*\* \*\*scope1:\*\* 2 First fix/,
    );
  });

  it('should accept a partial "presetConfig" object as option', async () => {
    const commits = [
      { hash: "111", message: "fix: First fix" },
      { hash: "222", message: "test: Change test" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {
        preset: ConventionalChangelogPreset.ConventionalCommits,
        presetConfig: {
          types: [
            { type: "fix", section: "Bug Fixes", hidden: true },
            { type: "test", section: "Test !!", hidden: false },
          ],
        },
      },
    );

    expect(changelog).not.toMatch(/### Bug Fixes/);
    expect(changelog).not.toMatch(new RegExp(escapeRegExp("First fix")));
    expect(changelog).toMatch(/### Test !!/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* Change test ([222](https://github.com/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it("should accept a custom repository URL", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "http://domain.com:90/owner/repo" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "(http://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](http://domain.com:90/owner/repo/commit/111))",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](http://domain.com:90/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it("should accept a custom repository URL with git format", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "git@domain.com:owner/repo.git" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://domain.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](https://domain.com/owner/repo/commit/111))",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](https://domain.com/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it("should accept a custom repository URL with git format without user", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "domain.com:owner/repo.git" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://domain.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](https://domain.com/owner/repo/commit/111))",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](https://domain.com/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it("should accept a custom repository URL with git+http format", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "git+http://domain.com:90/owner/repo" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "(http://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](http://domain.com:90/owner/repo/commit/111))",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](http://domain.com:90/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it('should accept a custom repository URL with ".git" extension', async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "https://domain.com:90/owner/repo.git" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "(https://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](https://domain.com:90/owner/repo/commit/111))",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](https://domain.com:90/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it("should accept a custom repository URL with git+https format", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix\n\nresolve #10" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "git+https://domain.com:90/owner/repo" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "(https://domain.com:90/owner/repo/compare/v1.0.0...v2.0.0)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](https://domain.com:90/owner/repo/commit/111)), closes [#10](https://domain.com:90/owner/repo/issues/10)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](https://domain.com:90/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it("should accept a custom repository URL with git+ssh format and custom port", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: {
          repositoryUrl: "git+ssh://git@domain.com:2222/owner/repo.git",
        },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://domain.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](https://domain.com/owner/repo/commit/111))",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](https://domain.com/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it("should accept a Bitbucket repository URL", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix\n\nResolves #10" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "git+https://bitbucket.org/owner/repo" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "(https://bitbucket.org/owner/repo/compare/v1.0.0...v2.0.0)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](https://bitbucket.org/owner/repo/commits/111)), closes [#10](https://bitbucket.org/owner/repo/issue/10)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](https://bitbucket.org/owner/repo/commits/222))",
        ),
      ),
    );
  });

  it("should accept a Gitlab repository URL", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix\n\nclosed #10" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "git+https://gitlab.com/owner/repo" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://gitlab.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](https://gitlab.com/owner/repo/commit/111)), closes [#10](https://gitlab.com/owner/repo/issues/10)",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](https://gitlab.com/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it('should accept a "linkCompare" option', async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix\n\nResolves #10" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "git+https://bitbucket.org/owner/repo" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      { linkCompare: false },
    );

    expect(changelog).toMatch(new RegExp(escapeRegExp("# 2.0.0")));
    expect(changelog).not.toMatch(
      new RegExp(
        escapeRegExp(
          "(https://bitbucket.org/owner/repo/compare/v1.0.0...v2.0.0)",
        ),
      ),
    );
  });

  it('should accept a "linkReferences" option', async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix\n\nResolves #10" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "git+https://bitbucket.org/owner/repo" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      { linkReferences: false },
    );

    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(escapeRegExp("* **scope1:** First fix 111, closes #10")),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(escapeRegExp("* **scope2:** Second feature 222")),
    );
  });

  it('should accept a "host" option', async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "feat(scope2): Second feature" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl: "https://github.com/owner/repo" },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      { host: "http://my-host:90" },
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(http://my-host:90/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](http://my-host:90/owner/repo/commit/111))",
        ),
      ),
    );
    expect(changelog).toMatch(/### Features/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope2:** Second feature ([222](http://my-host:90/owner/repo/commit/222))",
        ),
      ),
    );
  });

  it("should ignore mal-formatted commits and include valid ones", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "Feature => Invalid message" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(/\* \*\*scope1:\*\* First fix/);
    expect(changelog).not.toMatch(/### Features/);
    expect(changelog).not.toMatch(/Feature => Invalid message/);
  });

  it("should exclude commits if they have a matching revert commits", async () => {
    const commits = [
      {
        hash: "df012f1",
        message:
          "revert: feat(scope2): First feature\n\nThis reverts commit df012f2.\n",
      },
      { hash: "df012f2", message: "feat(scope2): First feature" },
      { hash: "df012f3", message: "fix(scope1): First fix" },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([df012f3](https://github.com/owner/repo/commit/df012f3))",
        ),
      ),
    );
    expect(changelog).not.toMatch(/### Features/);
    expect(changelog).not.toMatch(/Second feature/);
  });

  it("should exclude commits with empty message", async () => {
    const commits = [
      { hash: "111", message: "fix(scope1): First fix" },
      { hash: "222", message: "" },
      { hash: "333", message: "  " },
    ];
    const changelog = await generateNotes(
      {
        cwd,
        repositoryRoot,
        options: { repositoryUrl },
        package: pkg,
        lastRelease,
        nextRelease,
        commits,
      } as GenerateNotesContext,
      {},
    );

    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp("(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)"),
      ),
    );
    expect(changelog).toMatch(/### Bug Fixes/);
    expect(changelog).toMatch(
      new RegExp(
        escapeRegExp(
          "* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111))",
        ),
      ),
    );
    expect(changelog).not.toMatch(/222/);
    expect(changelog).not.toMatch(/333/);
  });

  it('should throw error if "preset" doesn`t exist', async () => {
    const commits = [
      { hash: "111", message: "Fix: First fix (fixes #123)" },
      { hash: "222", message: "Update: Second feature (fixes #456)" },
    ];

    await expect(
      generateNotes(
        {
          cwd,
          repositoryRoot,
          options: { repositoryUrl },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        { preset: "unknown-preset" } as never,
      ),
    ).rejects.toThrow(ZodError);
  });

  it('should throw error if "config" doesn`t exist', async () => {
    const commits = [
      { hash: "111", message: "Fix: First fix (fixes #123)" },
      { hash: "222", message: "Update: Second feature (fixes #456)" },
    ];

    await expect(
      generateNotes(
        {
          cwd,
          repositoryRoot,
          options: { repositoryUrl },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        { config: "unknown-config" },
      ),
    ).rejects.toThrowError();
  });

  it('should re-throw error from "conventional-changelog"', async () => {
    const commits = [
      { hash: "111", message: "Fix: First fix (fixes #123)" },
      { hash: "222", message: "Update: Second feature (fixes #456)" },
    ];

    await expect(
      generateNotes(
        {
          cwd,
          repositoryRoot,
          options: { repositoryUrl },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          writerOptions: {
            transform() {
              throw new Error("Test error");
            },
          },
        },
      ),
    ).rejects.toThrow("Test error");
  });

  describe('should accept an "issue" option', () => {
    it("angular preset", async () => {
      const commits = [
        { hash: "111", message: "fix(scope1): First fix\n\nresolve #10" },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        { preset: ConventionalChangelogPreset.Angular, issue: "test-issues" },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### Bug Fixes/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111)), closes [#10](https://github.com/owner/repo/test-issues/10)",
          ),
        ),
      );
    });

    it("atom preset", async () => {
      const commits = [
        { hash: "111", message: ":bug: First fix\n\nresolve #10" },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        { preset: ConventionalChangelogPreset.Atom, issue: "test-issues" },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### :bug:/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* First fix ([111](https://github.com/owner/repo/commit/111)), closes [#10](https://github.com/owner/repo/test-issues/10)",
          ),
        ),
      );
    });

    it("conventionalcommits preset", async () => {
      const commits = [
        { hash: "111", message: "fix(scope1): First fix\n\nresolve #10" },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.ConventionalCommits,
          issue: "test-issues",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### Bug Fixes/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* **scope1:** First fix ([111](https://github.com/owner/repo/commit/111)), closes [#10](https://github.com/owner/repo/test-issues/10)",
          ),
        ),
      );
    });

    it("eslint preset", async () => {
      const commits = [{ hash: "111", message: "Fix: First fix (fixes #10)" }];
      const changelog = await generateNotes(
        {
          cwd,
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.ESLint,
          issue: "test-issues",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### Fix/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* First fix (fixes #10) ([111](https://github.com/owner/repo/commit/111)), closes [#10](https://github.com/owner/repo/test-issues/10)",
          ),
        ),
      );
    });

    it("express preset", async () => {
      const commits = [{ hash: "111", message: "perf: First fix (fixes #10)" }];
      const changelog = await generateNotes(
        {
          cwd,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.Express,
          issue: "test-issues",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### Performance/);
      expect(changelog).toMatch(
        new RegExp(escapeRegExp("* First fix (fixes #10)")),
      );
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "Closes [#10](https://github.com/owner/repo/test-issues/10)",
          ),
        ),
      );
    });

    it("jquery preset", async () => {
      const commits = [
        {
          hash: "111",
          message:
            "Component: Short Description\n\nOptional Long Description\n\nFixes gh-10",
        },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.JQuery,
          issue: "test-issues",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* Short Description([111](https://github.com/owner/repo/commit/111)), closes [gh-10](https://github.com/owner/repo/test-issues/10)",
          ),
        ),
      );
    });

    it("jshint preset", async () => {
      const commits = [
        { hash: "111", message: "[[FIX]] First fix\n\nresolve #10" },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.JSHint,
          issue: "test-issues",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### Bug Fixes/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* First fix ([](https://github.com/owner/repo/commit/111)), closes [#10](https://github.com/owner/repo/test-issues/10)",
          ),
        ),
      );
    });
  });

  describe('should accept a "commit" option', () => {
    it("angular preset", async () => {
      const commits = [
        { hash: "111", message: "fix(scope1): First fix" },
        { hash: "222", message: "feat(scope2): Second feature" },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.Angular,
          commit: "test-commits",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### Bug Fixes/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* **scope1:** First fix ([111](https://github.com/owner/repo/test-commits/111))",
          ),
        ),
      );
      expect(changelog).toMatch(/### Features/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* **scope2:** Second feature ([222](https://github.com/owner/repo/test-commits/222))",
          ),
        ),
      );
    });

    it("atom preset", async () => {
      const commits = [
        { hash: "111", message: ":bug: First fix\n\nresolve #10" },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.Atom,
          commit: "test-commits",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### :bug:/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* First fix ([111](https://github.com/owner/repo/test-commits/111)), closes [#10](https://github.com/owner/repo/issues/10)",
          ),
        ),
      );
    });

    it("conventionalcommits preset", async () => {
      const commits = [
        { hash: "111", message: "fix(scope1): First fix\n\nresolve #10" },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.ConventionalCommits,
          commit: "test-commits",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### Bug Fixes/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* **scope1:** First fix ([111](https://github.com/owner/repo/test-commits/111)), closes [#10](https://github.com/owner/repo/issues/10)",
          ),
        ),
      );
    });

    it("eslint preset", async () => {
      const commits = [{ hash: "111", message: "Fix: First fix (fixes #10)" }];
      const changelog = await generateNotes(
        {
          cwd,
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.ESLint,
          commit: "test-commits",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### Fix/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* First fix (fixes #10) ([111](https://github.com/owner/repo/test-commits/111)), closes [#10](https://github.com/owner/repo/issues/10)",
          ),
        ),
      );
    });

    it("jquery preset", async () => {
      const commits = [
        {
          hash: "111",
          message:
            "Component: Short Description\n\nOptional Long Description\n\nFixes #10",
        },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.JQuery,
          commit: "test-commits",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* Short Description([111](https://github.com/owner/repo/test-commits/111)), closes [#10](https://bugs.jquery.com/ticket/10)",
          ),
        ),
      );
    });

    it("jshint preset", async () => {
      const commits = [
        { hash: "111", message: "[[FIX]] First fix\n\nresolve #10" },
      ];
      const changelog = await generateNotes(
        {
          cwd,
          repositoryRoot: path.resolve(import.meta.dirname, "../../"),
          options: { repositoryUrl: "https://github.com/owner/repo" },
          package: pkg,
          lastRelease,
          nextRelease,
          commits,
        } as GenerateNotesContext,
        {
          preset: ConventionalChangelogPreset.JSHint,
          commit: "test-commits",
        },
      );

      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "(https://github.com/owner/repo/compare/v1.0.0...v2.0.0)",
          ),
        ),
      );
      expect(changelog).toMatch(/### Bug Fixes/);
      expect(changelog).toMatch(
        new RegExp(
          escapeRegExp(
            "* First fix ([](https://github.com/owner/repo/test-commits/111)), closes [#10](https://github.com/owner/repo/issues/10)",
          ),
        ),
      );
    });
  });
});
