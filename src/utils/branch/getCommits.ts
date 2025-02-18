import path from "node:path";

import debug from "debug";
import { uniq } from "lodash-es";

import { BaseContext, Commit, Package } from "@lets-release/config";

import { name } from "src/program";
import { getMatchFiles } from "src/utils/getMatchFiles";
import { getCommittedFiles } from "src/utils/git/getCommittedFiles";
import { getLogs } from "src/utils/git/getLogs";

const namespace = `${name}:utils.branch.getCommits`;

/**
 * Retrieve the list of commits on the current branch since the commit sha associated with the last release, or all the commits of the current branch if there is no last released version.
 */
export async function getCommits(
  { env, repositoryRoot, options: { sharedWorkspaceFiles = [] } }: BaseContext,
  packages: Package[],
  from?: string,
  to = "HEAD",
): Promise<Partial<Record<string, Commit[]>>> {
  if (from) {
    debug(namespace)(`Use from: ${from}`);
  } else {
    debug(namespace)("Retrieving all commits");
  }

  const commits = await getLogs(to, from, { cwd: repositoryRoot, env });

  debug(namespace)(`Found ${commits.length} commits`);
  debug(namespace)("Parsed commits: %o", commits);

  const committedFiles = await Promise.all(
    commits.map(
      async ({ hash }) =>
        await getCommittedFiles(hash, {
          cwd: repositoryRoot,
          env,
        }),
    ),
  );

  const pkgPaths = new Set(packages.map(({ path }) => path));

  return Object.fromEntries(
    packages.map((pkg) => [
      pkg.name,
      commits.filter((_, index) => {
        const sharedFiles = new Set(
          uniq(
            sharedWorkspaceFiles.flatMap((asset) =>
              getMatchFiles({ repositoryRoot }, committedFiles[index], asset),
            ),
          ),
        );

        return committedFiles[index]
          .filter((file) => !sharedFiles.has(file))
          .some((file) => {
            let dir = path.dirname(path.resolve(repositoryRoot, file));

            while (!pkgPaths.has(dir)) {
              const nextDir = path.dirname(dir);

              if (nextDir === dir) return false;

              dir = nextDir;
            }

            return dir === pkg.path;
          });
      }),
    ]),
  );
}
