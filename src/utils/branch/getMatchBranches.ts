import { isArray, isString, remove } from "lodash-es";

import {
  BranchObject,
  BranchType,
  MaintenanceBranchSpec,
  NormalizedBranchesOptions,
  Package,
  PrereleaseBranchSpec,
  ReleaseBranchSpec,
} from "@lets-release/config";

import { MatchBranch } from "src/types/MatchBranch";
import { ParsedBranch } from "src/types/ParsedBranch";
import { filterParsedBranch } from "src/utils/branch/filterParsedBranch";
import { flatMapParsedBranch } from "src/utils/branch/flatMapParsedBranch";

export function getMatchBranches(
  packages: Package[],
  options: NormalizedBranchesOptions,
  parsedBranches: ParsedBranch[],
) {
  return (Object.keys(options) as BranchType[]).reduce(
    (match: { [K in BranchType]?: MatchBranch<K>[] }, type: BranchType) => {
      const objs = (
        (isArray(options[type]) ? options[type] : [options[type]]) as (
          | ReleaseBranchSpec
          | MaintenanceBranchSpec
          | PrereleaseBranchSpec
        )[]
      ).map((branch) => (isString(branch) ? { name: branch } : branch));

      return {
        ...match,
        [type]: objs.reduce(
          (
            matchBranches: MatchBranch[],
            obj: BranchObject,
          ): MatchBranch<typeof type>[] => {
            return [
              ...matchBranches,
              ...remove(parsedBranches as never, (branch) =>
                filterParsedBranch(type, obj.name, branch),
              ).flatMap((branch) =>
                flatMapParsedBranch(packages, type, obj, branch),
              ),
            ];
          },
          [],
        ),
      };
    },
    {},
  );
}
