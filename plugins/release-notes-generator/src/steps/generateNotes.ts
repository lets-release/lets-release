import { format } from "node:url";

import { ConventionalChangelog } from "conventional-changelog";
import debug from "debug";
import { readPackageUp } from "read-package-up";

import { Step, StepFunction, parseGitUrl } from "@lets-release/config";
import { loadPreset } from "@lets-release/conventional-changelog";

import { name } from "src/plugin";
import { ProvidedCommitsGitClient } from "src/ProvidedCommitsGitClient";
import { ReleaseNotesGeneratorOptions } from "src/schemas/ReleaseNotesGeneratorOptions";

/**
 * Generate the changelog for all the commits in `options.commits`.
 */
export const generateNotes: StepFunction<
  Step.generateNotes,
  ReleaseNotesGeneratorOptions
> = async (
  {
    cwd,
    options: { repositoryUrl },
    repositoryRoot,
    package: pkg,
    commits,
    lastRelease,
    nextRelease,
  },
  options,
) => {
  const parsedOptions = await ReleaseNotesGeneratorOptions.parseAsync(options);
  const preset = await loadPreset(
    parsedOptions,
    [pkg.path, repositoryRoot],
    cwd,
  );
  const previousTag = lastRelease?.tag;
  const currentTag = nextRelease.tag;
  const {
    host: hostConfig,
    linkCompare: isLinkCompare,
    linkReferences: isLinkReferences,
    commit: commitConfig,
    issue: issueConfig,
  } = parsedOptions;
  const { hostname, port, protocol, owner, repo } = parseGitUrl(repositoryUrl);
  const host =
    hostConfig ??
    format({
      protocol: protocol && /http[^s]/.test(protocol) ? "http" : "https",
      hostname,
      port: protocol.includes("ssh") ? "" : port,
    });
  const readResult = await readPackageUp({ normalize: false, cwd: pkg.path });
  const repository = {
    url: `${host}/${owner ?? ""}/${repo ?? ""}`,
    host,
    owner,
    project: repo,
    type: (hostname === "github.com" ||
    hostname === "gitlab.com" ||
    hostname === "bitbucket.org"
      ? hostname.slice(0, hostname.indexOf("."))
      : "") as "github" | "gitlab" | "bitbucket" | "",
  };
  const changelogContext = {
    version: nextRelease.version,
    previousTag,
    currentTag,
    linkCompare: isLinkCompare && !!currentTag && !!previousTag,
    linkReferences: isLinkReferences,
    host,
    commit: commitConfig,
    issue: issueConfig,
  };

  const namespace = `${name}:${pkg.uniqueName}`;
  debug(namespace)(`version: ${changelogContext.version}`);
  debug(namespace)(`host: ${changelogContext.host}`);
  debug(namespace)(`previousTag: ${changelogContext.previousTag}`);
  debug(namespace)(`currentTag: ${changelogContext.currentTag}`);
  debug(namespace)(`linkReferences: ${changelogContext.linkReferences}`);
  debug(namespace)(`commit: ${changelogContext.commit}`);
  debug(namespace)(`issue: ${changelogContext.issue}`);

  const generator = new ConventionalChangelog(
    new ProvidedCommitsGitClient(cwd, pkg, commits),
  )
    .config(preset)
    .repository(repository)
    .package({
      ...readResult?.packageJson,
      version: nextRelease.version,
    })
    .context(changelogContext);

  let changelog = "";

  for await (const chunk of generator.write()) {
    changelog += chunk;
  }

  return changelog;
};
