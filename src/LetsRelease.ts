import debug from "debug";
import envCi, { JenkinsEnv } from "env-ci";
import figures from "figures";
import { hookStd } from "hook-std";
import { escapeRegExp, isArray, template, uniq } from "lodash-es";
import signale from "signale";

import {
  BaseContext,
  BranchType,
  Context,
  HistoricalRelease,
  MainBranch,
  MaintenanceBranch,
  NextBranch,
  NextMajorBranch,
  NormalizedNextRelease,
  Options,
  Package,
  PrereleaseBranch,
  RELEASE_TYPES,
  ReleaseType,
  Step,
  compareReleaseTypes,
  extractErrors,
} from "@lets-release/config";

import { DuplicatePackagesError } from "src/errors/DuplicatePackagesError";
import { InvalidMaintenanceMergeError } from "src/errors/InvalidMaintenanceMergeError";
import { NoGitRepoError } from "src/errors/NoGitRepoError";
import { NoGitRepoPermissionError } from "src/errors/NoGitRepoPermissionError";
import { WorkflowsError } from "src/errors/WorkflowsError";
import {
  defaultGitUserEmail,
  defaultGitUserName,
  name,
  version,
} from "src/program";
import { MatchBranch } from "src/types/MatchBranch";
import {
  NormalizedStepContext,
  PartialNormalizedStepContext,
} from "src/types/NormalizedStepContext";
import { ReleasingContext } from "src/types/ReleasingContext";
import { StepPipelines } from "src/types/StepPipelines";
import { getBranches } from "src/utils/branch/getBranches";
import { getCommits } from "src/utils/branch/getCommits";
import { getMergingContexts } from "src/utils/branch/getMergingContexts";
import { getNextVersion } from "src/utils/branch/getNextVersion";
import { getNormalizedChannels } from "src/utils/branch/getNormalizedChannels";
import { getReleases } from "src/utils/branch/getReleases";
import { mapMatchBranch } from "src/utils/branch/mapMatchBranch";
import { mergeArtifacts } from "src/utils/branch/mergeArtifacts";
import { verifyMaintenanceMergeRange } from "src/utils/branch/verifyMaintenanceMergeRange";
import { getMaskingHandler } from "src/utils/getMaskingHandler";
import { getMatchFiles } from "src/utils/getMatchFiles";
import { addFiles } from "src/utils/git/addFiles";
import { addNote } from "src/utils/git/addNote";
import { addTag } from "src/utils/git/addTag";
import { commit } from "src/utils/git/commit";
import { getAuthUrl } from "src/utils/git/getAuthUrl";
import { getHeadHash } from "src/utils/git/getHeadHash";
import { getHeadName } from "src/utils/git/getHeadName";
import { getModifiedFiles } from "src/utils/git/getModifiedFiles";
import { getRoot } from "src/utils/git/getRoot";
import { getTagHash } from "src/utils/git/getTagHash";
import { isBranchUpToDate } from "src/utils/git/isBranchUpToDate";
import { isGitRepo } from "src/utils/git/isGitRepo";
import { pushBranch } from "src/utils/git/pushBranch";
import { pushNote } from "src/utils/git/pushNote";
import { pushTag } from "src/utils/git/pushTag";
import { verifyAuth } from "src/utils/git/verifyAuth";
import { loadConfig } from "src/utils/loadConfig";
import { logErrors } from "src/utils/logErrors";
import { parseMarkdown } from "src/utils/parseMarkdown";
import { getStepPipelinesList } from "src/utils/plugin/getStepPipelinesList";
import { verifyEngines } from "src/utils/verifyEngines";
import { verifyGitVersion } from "src/utils/verifyGitVersion";

// eslint-disable-next-line import-x/no-named-as-default-member
const { Signale } = signale;

export class LetsRelease {
  private pluginContexts: Record<string, unknown>[] = [];
  private pluginPackageContexts: Record<string, unknown>[] = [];
  private releaseTypes: Record<string, ReleaseType | undefined> = {};

  async run(options: Partial<Options> = {}, context: Context = {}) {
    const { cwd = process.cwd(), env = process.env } = context;
    const extendedEnv = {
      GIT_AUTHOR_NAME: defaultGitUserName,
      GIT_AUTHOR_EMAIL: defaultGitUserEmail,
      GIT_COMMITTER_NAME: defaultGitUserName,
      GIT_COMMITTER_EMAIL: defaultGitUserEmail,
      ...env,
      GIT_ASKPASS: "echo",
      GIT_TERMINAL_PROMPT: 0 as never,
    };
    const { unhook } = hookStd(
      {
        silent: false,
        streams: [
          process.stdout,
          process.stderr,
          context.stdout,
          context.stderr,
        ].filter(Boolean) as NodeJS.WritableStream[],
      },
      getMaskingHandler(extendedEnv),
    );
    const stdout = context.stdout ?? process.stdout;
    const stderr = context.stderr ?? process.stderr;
    const logger = new Signale({
      config: {
        displayTimestamp: true,
        underlineMessage: false,
        displayLabel: false,
      },
      disabled: false,
      interactive: false,
      scope: name,
      stream: [stdout],
      types: {
        log: {
          badge: figures.info,
          color: "magenta",
          label: "",
          stream: [stdout],
        },
        warn: {
          badge: figures.warning,
          color: "yellow",
          label: "",
          stream: [stderr],
        },
        error: {
          badge: figures.cross,
          color: "red",
          label: "",
          stream: [stderr],
        },
        success: {
          badge: figures.tick,
          color: "green",
          label: "",
          stream: [stdout],
        },
      },
    });

    logger.log(`Running ${name} version ${version}`);

    try {
      verifyEngines();
      await verifyGitVersion({ cwd, env: extendedEnv });

      if (!(await isGitRepo({ cwd, env: extendedEnv }))) {
        throw new NoGitRepoError(cwd);
      }

      const repositoryRoot = await getRoot({ cwd, env: extendedEnv });
      const normalizedOptions = await loadConfig(options, {
        env: extendedEnv,
        repositoryRoot,
      });

      const ciEnv = envCi({ cwd: repositoryRoot, env: extendedEnv });
      const { isCi, isPr, branch, prBranch } = ciEnv as JenkinsEnv;

      if (isCi && isPr && !normalizedOptions.skipCiVerifications) {
        logger.log("Triggered by a pull request, skip releasing");

        return;
      }

      if (
        !isCi &&
        !normalizedOptions.dryRun &&
        !normalizedOptions.skipCiVerifications
      ) {
        normalizedOptions.dryRun = true;

        logger.warn(
          "NOT triggered in a known CI environment, running in dry-run mode",
        );
      }

      const ciBranch =
        (isPr ? prBranch : branch) ??
        (await getHeadName({ cwd: repositoryRoot, env: extendedEnv }));
      const repoAuthUrl = await getAuthUrl(
        normalizedOptions.repositoryUrl,
        ciBranch,
        {
          cwd: repositoryRoot,
          env: extendedEnv,
        },
      );

      try {
        await verifyAuth(repoAuthUrl, ciBranch, {
          cwd: repositoryRoot,
          env: extendedEnv,
        });
      } catch (error) {
        if (
          !(await isBranchUpToDate(repoAuthUrl, ciBranch, {
            cwd: repositoryRoot,
            env: extendedEnv,
          }))
        ) {
          logger.log(
            `The local branch ${ciBranch} is not up to date, skip releasing`,
          );

          return;
        }

        throw new NoGitRepoPermissionError(
          normalizedOptions.repositoryUrl,
          ciBranch,
          error,
        );
      }

      return await this.runWorkflows(
        repoAuthUrl,
        ciBranch,
        {
          cwd,
          // When running on CI, set the commits author and committer info and prevent the `git` CLI to prompt for username/password.
          env: extendedEnv,
          stdout,
          stderr,
          logger,
          ciEnv,
          repositoryRoot,
          options: normalizedOptions,
        },
        await getStepPipelinesList({
          cwd,
          stdout,
          stderr,
          logger,
          repositoryRoot,
          options: normalizedOptions,
        }),
      );
    } catch (error) {
      await logErrors({ stderr, logger }, error);

      throw error;
      // FIXME: v8 report `} finally {` as uncovered line
      /* v8 ignore next 1 */
    } finally {
      unhook();
    }
  }

  private async runWorkflows(
    repoAuthUrl: string,
    branchName: string,
    baseContext: BaseContext,
    stepPipelinesList: StepPipelines[],
  ) {
    const {
      env,
      stderr,
      options: { dryRun, refSeparator, releaseCommit, mainPackage },
      logger,
      repositoryRoot,
    } = baseContext;

    const rawPkgs = await this.runGroupWorkflows(
      { stderr, logger },
      stepPipelinesList,
      async (index, stepPipelines) =>
        (await stepPipelines.findPackages?.(
          stepPipelines,
          this.normalizeContext<Step.findPackages>(
            {
              ...baseContext,
              packageOptions: baseContext.options.packages[index],
            },
            index,
          ),
        )) ?? [],
    );
    const flattenRawPkgs = rawPkgs.flat();
    const packages = rawPkgs.map((list) =>
      list.map<Package>(({ type, name, ...rest }) => {
        const uniqueName =
          flattenRawPkgs.filter((pkg) => pkg.name === name).length > 1
            ? `${type}${refSeparator}${name}`
            : name;

        return {
          ...rest,
          ...((mainPackage && uniqueName === mainPackage) ||
          flattenRawPkgs.length === 1
            ? { main: true }
            : {}),
          type,
          name,
          uniqueName,
        };
      }),
    );
    const flattenPackages = packages.flat();
    const duplicates = flattenPackages
      .map(({ uniqueName }) => uniqueName)
      .toSorted()
      .filter(
        (_, idx, array) =>
          array[idx] === array[idx + 1] && array[idx] !== array[idx - 1],
      );

    if (duplicates.length > 0) {
      throw new DuplicatePackagesError(duplicates);
    }

    const branches = await getBranches(
      baseContext,
      repoAuthUrl,
      branchName,
      flattenPackages,
    );
    const flattenBranches = Object.values(branches).flatMap((value) =>
      isArray(value)
        ? (value as (
            | MainBranch
            | NextBranch
            | NextMajorBranch
            | MaintenanceBranch
            | PrereleaseBranch
          )[])
        : value
          ? ([value] as (
              | MainBranch
              | NextBranch
              | NextMajorBranch
              | MaintenanceBranch
              | PrereleaseBranch
            )[])
          : [],
    );
    const currentBranch = flattenBranches.find(
      ({ name }) => name === branchName,
    );

    if (!currentBranch) {
      logger.log(
        `Triggered on the branch ${branchName}, while configured branches are [${flattenBranches
          .map(({ name }) => name)
          .join(", ")}], skip releasing`,
      );

      return;
    }

    const context = {
      ...baseContext,
      branches,
      branch: currentBranch,
    };

    await this.runRecursiveWorkflows(
      { stderr, logger },
      stepPipelinesList,
      packages,
      (current) => current,
      async (index, stepPipelines, packages) =>
        await stepPipelines.verifyConditions?.(
          stepPipelines,
          this.normalizeContext<Step.verifyConditions>(
            {
              ...context,
              packageOptions: context.options.packages[index],
              packages,
            },
            index,
          ),
        ),
    );

    const mergedReleases =
      currentBranch.type === BranchType.prerelease
        ? []
        : await this.runRecursiveWorkflows<HistoricalRelease[]>(
            { stderr, logger },
            stepPipelinesList,
            packages,
            (current, prev) => [...(prev ?? []), ...current],
            async (index, stepPipelines, packages) =>
              await this.handleMergedReleases(
                repoAuthUrl,
                flattenPackages,
                index,
                stepPipelines,
                {
                  ...context,
                  packageOptions: context.options.packages[index],
                  packages,
                },
              ),
          );

    const releasingContexts = await this.runRecursiveWorkflows<
      Record<string, ReleasingContext>
    >(
      { stderr, logger },
      stepPipelinesList,
      packages,
      (current, prev) => ({ ...prev, ...current }),
      async (index, stepPipelines, packages) =>
        await this.makeReleases(flattenPackages, index, stepPipelines, {
          ...context,
          packageOptions: context.options.packages[index],
          packages,
        }),
    );

    if (releaseCommit) {
      if (dryRun) {
        logger.warn("Skip committing changes in dry-run mode");
      } else {
        const { assets, message } = releaseCommit;
        const modifiedFiles = await getModifiedFiles({
          cwd: repositoryRoot,
          env,
        });
        const filesToCommit = assets
          ? uniq(
              assets.flatMap((asset) =>
                getMatchFiles(baseContext, modifiedFiles, asset),
              ),
            )
          : [];

        if (filesToCommit.length > 0) {
          debug(name)("committed files: %o", filesToCommit);

          await addFiles(filesToCommit, { cwd: repositoryRoot, env });
        }

        if (!assets || filesToCommit.length > 0) {
          await commit(
            template(message)({
              releases: releasingContexts.flatMap((contexts) =>
                Object.values(contexts).map(({ nextRelease }) => nextRelease),
              ),
            }),
            { cwd: repositoryRoot, env },
          );
          await pushBranch(repoAuthUrl, currentBranch.name, {
            cwd: repositoryRoot,
            env,
          });
        }

        if (filesToCommit.length > 0) {
          logger.log(`Committed ${filesToCommit.length} file(s)`);
        }
      }
    }

    const hash = await getHeadHash({ cwd: repositoryRoot, env });

    const madeReleases = await this.runRecursiveWorkflows<HistoricalRelease[]>(
      { stderr, logger },
      stepPipelinesList,
      packages,
      (current, prev) => [...(prev ?? []), ...current],
      async (index, stepPipelines, packages) =>
        await this.publishReleases(
          repoAuthUrl,
          index,
          stepPipelines,
          {
            ...context,
            packageOptions: context.options.packages[index],
            packages,
          },
          Object.fromEntries(
            Object.entries(releasingContexts[index]).map(([key, value]) => [
              key,
              {
                ...value,
                nextRelease: {
                  ...value.nextRelease,
                  hash,
                },
              },
            ]),
          ),
        ),
    );

    return [...mergedReleases.flat(), ...madeReleases.flat()];
  }

  private async runRecursiveWorkflows<T>(
    { stderr, logger }: Pick<BaseContext, "stderr" | "logger">,
    stepPipelinesList: StepPipelines[],
    packages: Package[][],
    resultHandler: (current: T, prev?: T) => T,
    workflow: (
      index: number,
      stepPipelines: StepPipelines,
      packages: Package[],
    ) => Promise<T>,
  ): Promise<T[]> {
    const result: T[] = [];
    const errors: unknown[] = [];
    const handledPackages = new Set<string>([]);

    while (true) {
      const unhandledPackages: Package[][] = packages.map((list) =>
        list.filter(({ type, name, dependencies }) => {
          if (handledPackages.has(`${type}/${name}`)) {
            return false;
          }

          return (
            !dependencies?.length ||
            !!dependencies.every(({ type, name }) =>
              handledPackages.has(`${type}/${name}`),
            )
          );
        }),
      );

      if (unhandledPackages.flat().length === 0) {
        break;
      }

      for (const [index, stepPipelines] of stepPipelinesList.entries()) {
        try {
          result[index] = resultHandler(
            await workflow(index, stepPipelines, unhandledPackages[index]),
            result[index],
          );
        } catch (error) {
          await logErrors({ stderr, logger }, error);

          errors.push(...extractErrors(error));
        }

        for (const { type, name } of unhandledPackages[index]) {
          handledPackages.add(`${type}/${name}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new WorkflowsError(errors);
    }

    return result;
  }

  private async runGroupWorkflows<T>(
    { stderr, logger }: Pick<BaseContext, "stderr" | "logger">,
    stepPipelinesList: StepPipelines[],
    workflow: (index: number, stepPipelines: StepPipelines) => Promise<T>,
  ): Promise<T[]> {
    const result: T[] = [];
    const errors: unknown[] = [];

    for (const [index, stepPipelines] of stepPipelinesList.entries()) {
      try {
        result.push(await workflow(index, stepPipelines));
      } catch (error) {
        await logErrors({ stderr, logger }, error);

        errors.push(...extractErrors(error));
      }
    }

    if (errors.length > 0) {
      throw new WorkflowsError(errors);
    }

    return result;
  }

  private async runPackageWorkflows<T>(
    { stderr, logger }: Pick<BaseContext, "stderr" | "logger">,
    packages: Package[],
    workflow: (pkg: Package) => Promise<T>,
  ): Promise<T[]> {
    const result: T[] = [];
    const errors: unknown[] = [];

    for (const pkg of packages) {
      try {
        result.push(await workflow(pkg));
      } catch (error) {
        const workflowErrors = extractErrors(error);

        for (const err of workflowErrors) {
          Object.assign(err as object, { pkg });
        }

        await logErrors(
          { stderr, logger },
          new AggregateError(workflowErrors, "AggregateError"),
        );

        errors.push(...workflowErrors);
      }
    }

    if (errors.length > 0) {
      throw new WorkflowsError(errors);
    }

    return result;
  }

  private getPluginContext = <T>(
    index: number,
    pluginName: string,
  ): T | undefined => {
    return this.pluginContexts[index]?.[pluginName] as T | undefined;
  };

  private setPluginContext = <T>(
    index: number,
    pluginName: string,
    value: T,
  ) => {
    this.pluginContexts[index] = {
      ...this.pluginContexts[index],
      [pluginName]: value,
    };
  };

  private getPluginPackageContext = <T>(
    index: number,
    pluginName: string,
    packageType: string,
    packageName: string,
  ): T | undefined => {
    return this.pluginPackageContexts[index]?.[
      `${pluginName}-${packageType}:${packageName}`
    ] as T | undefined;
  };

  private setPluginPackageContext = <T>(
    index: number,
    pluginName: string,
    packageType: string,
    packageName: string,
    value: T,
  ) => {
    this.pluginPackageContexts[index] = {
      ...this.pluginPackageContexts[index],
      [`${pluginName}-${packageType}:${packageName}`]: value,
    };
  };

  private normalizeContext = <T extends Step>(
    context: PartialNormalizedStepContext<T>,
    index: number,
  ): NormalizedStepContext<T> => {
    return {
      ...context,
      getPluginContext: <T>(pluginName: string) =>
        this.getPluginContext<T>(index, pluginName),
      setPluginContext: <T>(pluginName: string, value: T) =>
        this.setPluginContext<T>(index, pluginName, value),
      getPluginPackageContext: <T>(
        pluginName: string,
        packageType: string,
        packageName: string,
      ) =>
        this.getPluginPackageContext<T>(
          index,
          pluginName,
          packageType,
          packageName,
        ),
      setPluginPackageContext: <T>(
        pluginName: string,
        packageType: string,
        packageName: string,
        value: T,
      ) =>
        this.setPluginPackageContext<T>(
          index,
          pluginName,
          packageType,
          packageName,
          value,
        ),
    } as NormalizedStepContext<T>;
  };

  private async handleMergedReleases(
    repoAuthUrl: string,
    allPackages: Package[],
    index: number,
    stepPipelines: StepPipelines,
    context: PartialNormalizedStepContext<Step.verifyConditions>,
  ): Promise<HistoricalRelease[]> {
    const {
      env,
      stderr,
      logger,
      repositoryRoot,
      options: { dryRun },
      packages,
      branches,
      branch,
    } = context;

    const releases = await this.runPackageWorkflows(
      { stderr, logger },
      packages,
      async (pkg) => {
        const mergingContexts = await getMergingContexts(
          context,
          [pkg],
          branches,
          branch as Parameters<typeof getMergingContexts>[3],
        );
        const mergingContext = mergingContexts[pkg.uniqueName];

        if (!mergingContext) {
          return [];
        }

        const { lastRelease, currentRelease, nextRelease } = mergingContext;
        const range = (branch as MaintenanceBranch)?.ranges?.[pkg.uniqueName];

        if (
          range?.mergeMin &&
          !verifyMaintenanceMergeRange(pkg, range, nextRelease.version)
        ) {
          throw new InvalidMaintenanceMergeError(
            pkg,
            range,
            branch.name,
            nextRelease,
          );
        }

        const commits = await getCommits(
          {
            ...context,
            packages: [pkg],
          },
          allPackages,
          lastRelease?.hash,
          nextRelease.hash,
        );

        const normalizedContext: NormalizedStepContext<Step.generateNotes> =
          this.normalizeContext<Step.generateNotes>(
            {
              ...context,
              commits: commits[pkg.uniqueName] ?? [],
              package: pkg,
              lastRelease,
              nextRelease,
            },
            index,
          );

        const notes = await stepPipelines.generateNotes?.(
          stepPipelines,
          normalizedContext,
        );

        const addChannelsContext: NormalizedStepContext<Step.addChannels> = {
          ...normalizedContext,
          currentRelease,
          nextRelease: {
            ...nextRelease,
            notes,
          },
        };

        const artifacts =
          (await stepPipelines
            .addChannels?.(stepPipelines, addChannelsContext)
            .catch(async (error) => {
              try {
                await stepPipelines.fail?.(stepPipelines, {
                  ...addChannelsContext,
                  error,
                } as NormalizedStepContext<Step.fail>);
              } catch (failError) {
                throw new AggregateError(
                  [...extractErrors(error), ...extractErrors(failError)],
                  "AggregateError",
                );
              }

              throw error;
            })) ?? [];

        const mergedArtifacts = mergeArtifacts(
          currentRelease.artifacts,
          artifacts,
        );

        branch.tags[pkg.uniqueName] = branch.tags[pkg.uniqueName]?.map(
          (tag) => {
            if (tag.tag !== nextRelease.tag) {
              return tag;
            }

            return {
              ...tag,
              artifacts: mergedArtifacts,
            };
          },
        );

        if (!dryRun) {
          await addNote(
            nextRelease.tag,
            {
              artifacts: mergedArtifacts,
            },
            {
              cwd: repositoryRoot,
              env,
            },
          );
          await pushNote(repoAuthUrl, nextRelease.tag, {
            cwd: repositoryRoot,
            env,
          });
        }

        const release: HistoricalRelease = {
          ...nextRelease,
          artifacts,
        };

        await stepPipelines.success?.(stepPipelines, {
          ...normalizedContext,
          nextRelease: {
            ...nextRelease,
            notes,
          },
          releases: [release],
        });

        return [release];
      },
    );

    return releases.flat();
  }

  private async makeReleases(
    allPackages: Package[],
    index: number,
    stepPipelines: StepPipelines,
    context: PartialNormalizedStepContext<Step.verifyConditions>,
  ): Promise<Record<string, ReleasingContext>> {
    const {
      env,
      stderr,
      logger,
      repositoryRoot,
      options: {
        prerelease,
        tagFormat,
        refSeparator,
        releaseFollowingDependencies,
      },
      packages,
      branch,
    } = context;

    const hash = await getHeadHash({ cwd: repositoryRoot, env });

    const contexts: [
      string,
      Pick<
        NormalizedStepContext<Step.prepare>,
        "lastRelease" | "commits" | "nextRelease"
      >,
    ][][] = await this.runPackageWorkflows(
      { stderr, logger },
      packages,
      async (pkg) => {
        let last = getReleases(context, branch, [pkg])[pkg.uniqueName]?.[0];

        if (!last && pkg.formerName) {
          const formerNamePkg = {
            ...pkg,
            name: pkg.formerName,
            uniqueName: pkg.uniqueName.replace(
              new RegExp(`${escapeRegExp(pkg.name)}$`),
              pkg.formerName,
            ),
          };
          const { tags: formerNameTags } = await mapMatchBranch(
            context,
            [formerNamePkg],
            branch as MatchBranch,
          );

          last = getReleases(context, { ...branch, tags: formerNameTags }, [
            formerNamePkg,
          ])[formerNamePkg.uniqueName]?.[0];
        }

        if (last) {
          logger.log({
            prefix: `[${pkg.uniqueName}]`,
            message: `Found git tag ${last.tag} associated with version ${last.version} on branch ${branch.name}`,
          });
        } else {
          logger.log({
            prefix: `[${pkg.uniqueName}]`,
            message: `No git tag version found on branch ${branch.name}`,
          });
        }

        const lastRelease = last
          ? {
              ...last,
              hash: await getTagHash(last.tag, { cwd: repositoryRoot, env }),
            }
          : undefined;
        const commits = await getCommits(
          {
            ...context,
            packages: [pkg],
          },
          allPackages,
          lastRelease?.hash,
        );
        const normalizedContext: NormalizedStepContext<Step.analyzeCommits> =
          this.normalizeContext<Step.analyzeCommits>(
            {
              ...context,
              commits: commits[pkg.uniqueName] ?? [],
              package: pkg,
              lastRelease,
            },
            index,
          );

        let releaseType = await stepPipelines.analyzeCommits?.(
          stepPipelines,
          normalizedContext,
        );

        if (releaseFollowingDependencies && releaseType !== RELEASE_TYPES[0]) {
          const deps =
            (pkg.dependencies?.map(
              ({ type, name }) =>
                allPackages.find(
                  (pkg) => pkg.type === type && pkg.name === name,
                )?.uniqueName,
            ) as string[]) ?? [];

          for (const dep of deps) {
            const depReleaseType = this.releaseTypes[dep];

            // Set release type if dependency release type is higher
            if (
              depReleaseType &&
              compareReleaseTypes(depReleaseType, releaseType)
            ) {
              releaseType = depReleaseType;
            }
          }
        }

        this.releaseTypes[pkg.uniqueName] = releaseType;

        if (!releaseType) {
          logger.log({
            prefix: `[${pkg.uniqueName}]`,
            message:
              "There are no relevant changes, so no new version is released",
          });

          return [];
        }

        const version = getNextVersion(normalizedContext, releaseType, hash);

        if (!version) {
          return [];
        }

        const versionTag = template(tagFormat)({ version });
        const tag = pkg.main
          ? versionTag
          : `${pkg.uniqueName}${refSeparator}${versionTag}`;
        const nextRelease: NormalizedNextRelease = {
          tag,
          hash,
          version,
          artifacts: [],
          channels:
            branch.type === BranchType.prerelease
              ? getNormalizedChannels(branch)
              : getNormalizedChannels(branch, prerelease),
        };

        await stepPipelines.verifyRelease?.(stepPipelines, {
          ...normalizedContext,
          nextRelease,
        });

        const notes = await stepPipelines.generateNotes?.(stepPipelines, {
          ...normalizedContext,
          nextRelease,
        });

        await stepPipelines.prepare?.(stepPipelines, {
          ...normalizedContext,
          nextRelease: {
            ...nextRelease,
            notes,
          },
        });

        return [
          [
            pkg.uniqueName,
            {
              lastRelease,
              commits: commits[pkg.uniqueName] ?? [],
              nextRelease: {
                ...nextRelease,
                notes,
              },
            },
          ],
        ];
      },
    );

    return Object.fromEntries(contexts.flat());
  }

  private async publishReleases(
    repoAuthUrl: string,
    index: number,
    stepPipelines: StepPipelines,
    context: PartialNormalizedStepContext<Step.verifyConditions>,
    releasingContexts: Partial<Record<string, ReleasingContext>>,
  ): Promise<HistoricalRelease[]> {
    const {
      env,
      stderr,
      logger,
      repositoryRoot,
      options: { dryRun },
      packages,
    } = context;

    const releases = await this.runPackageWorkflows(
      { stderr, logger },
      packages,
      async (pkg) => {
        const releasingContext = releasingContexts[pkg.uniqueName];

        if (!releasingContext) {
          return [];
        }

        const { lastRelease, commits, nextRelease } = releasingContext;

        if (dryRun) {
          logger.warn({
            prefix: `[${pkg.uniqueName}]`,
            message: `Skip ${nextRelease.tag} tag creation in dry-run mode`,
          });
        } else {
          await addTag(nextRelease.hash, nextRelease.tag, {
            cwd: repositoryRoot,
            env,
          });
          await pushTag(repoAuthUrl, nextRelease.tag, {
            cwd: repositoryRoot,
            env,
          });

          logger.success({
            prefix: `[${pkg.uniqueName}]`,
            message: `Created tag ${nextRelease.tag}`,
          });
        }

        const normalizedContext: NormalizedStepContext<Step.publish> =
          this.normalizeContext<Step.publish>(
            {
              ...context,
              commits,
              package: pkg,
              lastRelease,
              nextRelease,
            },
            index,
          );

        const artifacts =
          (await stepPipelines
            .publish?.(stepPipelines, normalizedContext)
            .catch(async (error) => {
              try {
                await stepPipelines.fail?.(stepPipelines, {
                  ...normalizedContext,
                  error,
                });
              } catch (failError) {
                throw new AggregateError(
                  [...extractErrors(error), ...extractErrors(failError)],
                  "AggregateError",
                );
              }

              throw error;
            })) ?? [];

        if (!dryRun) {
          await addNote(
            nextRelease.tag,
            {
              artifacts,
            },
            {
              cwd: repositoryRoot,
              env,
            },
          );
          await pushNote(repoAuthUrl, nextRelease.tag, {
            cwd: repositoryRoot,
            env,
          });
        }

        const release: HistoricalRelease = {
          ...nextRelease,
          artifacts,
        };

        await stepPipelines.success?.(stepPipelines, {
          ...normalizedContext,
          releases: [release],
        });

        logger.success({
          prefix: `[${pkg.uniqueName}]`,
          message: `Published release ${nextRelease.version} on ${JSON.stringify(nextRelease.channels)} channels`,
        });

        if (dryRun && nextRelease.notes) {
          logger.log({
            prefix: `[${pkg.uniqueName}]`,
            message: `Release note for version ${nextRelease.version}:`,
          });

          context.stdout.write(await parseMarkdown(nextRelease.notes));
        }

        return [release];
      },
    );

    return releases.flat();
  }
}
