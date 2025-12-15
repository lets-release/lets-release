import debug from "debug";
import { escapeRegExp, template } from "lodash-es";

import { isValidCalVer } from "@lets-release/calver";
import {
  BaseContext,
  BranchType,
  Package,
  VersionTag,
  VersioningScheme,
} from "@lets-release/config";
import { isValidSemVer } from "@lets-release/semver";

import { name } from "src/program";
import { MatchBranch, MatchPrereleaseBranch } from "src/types/MatchBranch";
import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { sortPackageVersions } from "src/utils/branch/sortPackageVersions";
import { getBranchTags } from "src/utils/git/getBranchTags";
import { getNote } from "src/utils/git/getNote";

export async function mapMatchBranch<T extends BranchType = BranchType>(
  { env, repositoryRoot, options: { tagFormat, refSeparator } }: BaseContext,
  packages: Package[],
  { name: branchName, ...rest }: MatchBranch<T>,
): Promise<MatchBranchWithTags<T>> {
  const { prerelease } = rest as unknown as MatchPrereleaseBranch;
  const mainPkg = packages.find(({ main }) => main);

  // Generate a regex to parse tags formatted with `tagFormat`
  // by replacing the `version` variable in the template by `(.+)`.
  // The `tagFormat` is compiled with space as the `version` as it's an invalid tag character,
  // so it's guaranteed to no be present in the `tagFormat`.
  const tagRegExp = new RegExp(
    `^((${packages.map(({ uniqueName }) => escapeRegExp(uniqueName)).join("|")})${escapeRegExp(refSeparator)})?${escapeRegExp(
      template(tagFormat)({ version: " " }),
    ).replace(" ", "(.+)")}$`,
  );

  const tags = await getBranchTags(branchName, { cwd: repositoryRoot, env });
  const matchTagsList: VersionTag[][] = await Promise.all(
    tags.map(async (tag) => {
      const [pkgName, version] = tag.match(tagRegExp)?.slice(2) ?? [];
      const pkg = packages.find(({ uniqueName }) =>
        pkgName ? pkgName === uniqueName : mainPkg?.uniqueName === uniqueName,
      );

      const cleanVersion = version?.trim().replace(/^[=v]+/, "");

      if (!pkg || !cleanVersion) {
        return [];
      }

      if (
        pkg.versioning.scheme === VersioningScheme.SemVer &&
        !isValidSemVer(cleanVersion)
      ) {
        return [];
      }

      if (
        pkg.versioning.scheme === VersioningScheme.CalVer &&
        !isValidCalVer(pkg.versioning.format, cleanVersion)
      ) {
        return [];
      }

      const { artifacts } = await getNote(tag, { cwd: repositoryRoot, env });

      return [
        {
          package: pkg.uniqueName,
          tag,
          version: cleanVersion,
          artifacts: artifacts ?? [],
        },
      ];
    }),
  );
  const flattenMatchTagsList = matchTagsList.flat();
  const matchTags = Object.fromEntries(
    packages.map((pkg) => {
      const tags = flattenMatchTagsList.filter(
        ({ package: pkgName }) => pkgName === pkg.uniqueName,
      );

      return [pkg.uniqueName, sortPackageVersions(pkg, tags, "desc")];
    }),
  );

  debug(`${name}:utils.branch.mapMatchBranch`)(
    `found tags for branch ${branchName}: %o`,
    matchTags,
  );

  return {
    ...rest,
    name: branchName,
    prerelease,
    tags: matchTags,
  } as unknown as MatchBranchWithTags<T>;
}
