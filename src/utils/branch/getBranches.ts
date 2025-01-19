import {
  BaseContext,
  BranchType,
  Branches,
  Package,
} from "@lets-release/config";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getMatchBranches } from "src/utils/branch/getMatchBranches";
import { mapMatchBranch } from "src/utils/branch/mapMatchBranch";
import { normalizeBranches } from "src/utils/branch/normalizeBranches";
import { parseBranchName } from "src/utils/branch/parseBranchName";
import { fetchBranchTags } from "src/utils/git/fetchBranchTags";
import { fetchNotes } from "src/utils/git/fetchNotes";
import { getRemoteBranches } from "src/utils/git/getRemoteBranches";

export async function getBranches(
  context: BaseContext,
  repositoryUrl: string,
  ciBranch: string,
  packages: Package[],
): Promise<Branches> {
  const {
    env,
    repositoryRoot,
    options: { branches },
  } = context;
  const remoteBranches = await getRemoteBranches(repositoryUrl, {
    cwd: repositoryRoot,
  });
  const matchBranches = getMatchBranches(
    packages,
    branches,
    remoteBranches.map((name) => ({
      name,
      ...parseBranchName(
        name,
        packages.map(({ name }) => name),
      ),
    })),
  );

  for (const { name } of Object.values(matchBranches).flat()) {
    await fetchBranchTags(repositoryUrl, name, ciBranch, {
      cwd: repositoryRoot,
      env,
    });
  }

  await fetchNotes(repositoryUrl, { cwd: repositoryRoot, env });

  const branchesWithTags: {
    [K in BranchType]?: MatchBranchWithTags<K>[];
  } = Object.fromEntries(
    await Promise.all(
      Object.entries(matchBranches).map(async ([type, list]) => [
        type,
        await Promise.all(
          list.map(
            async (branch) => await mapMatchBranch(context, packages, branch),
          ),
        ),
      ]),
    ),
  );

  return normalizeBranches(packages, branchesWithTags);
}
