import { debug } from "debug";
import { isNil, pickBy } from "lodash-es";

import { BranchType, Branches, Package } from "@lets-release/config";

import { NoMainBranchError } from "src/errors/NoMainBranchError";
import { name } from "src/program";
import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { normalizeMainBranch } from "src/utils/branch/normalizeMainBranch";
import { normalizeMaintenanceBranches } from "src/utils/branch/normalizeMaintenanceBranches";
import { normalizeNextBranch } from "src/utils/branch/normalizeNextBranch";
import { normalizeNextMajorBranch } from "src/utils/branch/normalizeNextMajorBranch";
import { normalizePrereleaseBranches } from "src/utils/branch/normalizePrereleaseBranches";

const namespace = `${name}:utils.branch.normalizeBranches`;

export function normalizeBranches(
  packages: Package[],
  branches: {
    [K in BranchType]?: MatchBranchWithTags<K>[];
  },
): Branches {
  const main = branches.main?.[0];

  if (!main) {
    throw new NoMainBranchError();
  }

  if (branches.main && branches.main.length > 1) {
    debug(namespace)(
      `Multiple main branches found, using the first one: ${main?.name}`,
    );
  }

  const next = branches.next?.[0];

  if (branches.next?.length && branches.next.length > 1) {
    debug(namespace)(
      `Multiple next branches found, using the first one: ${next?.name}`,
    );
  }

  const nextMajor = branches.nextMajor?.[0];

  if (branches.nextMajor?.length && branches.nextMajor.length > 1) {
    debug(namespace)(
      `Multiple next minor branches found, using the first one: ${nextMajor?.name}`,
    );
  }

  const { branch: mainBranch, latestSemVers: latestMainSemVers } =
    normalizeMainBranch(packages, main, next, nextMajor);
  const { branch: nextBranch, latestSemVers: latestNextSemVers } =
    normalizeNextBranch(
      packages,
      mainBranch!,
      latestMainSemVers,
      next,
      nextMajor,
    );
  const { branch: nextMajorBranch } = normalizeNextMajorBranch(
    packages,
    mainBranch!,
    nextBranch,
    {
      ...pickBy(latestMainSemVers, (v?: string) => !isNil(v)),
      ...pickBy(latestNextSemVers, (v?: string) => !isNil(v)),
    },
    nextMajor,
  );

  return {
    [BranchType.main]: mainBranch,
    [BranchType.next]: nextBranch,
    [BranchType.nextMajor]: nextMajorBranch,
    [BranchType.maintenance]: normalizeMaintenanceBranches(
      packages,
      main,
      branches.maintenance,
    ),
    [BranchType.prerelease]: normalizePrereleaseBranches(branches.prerelease),
  };
}
