import { $ } from "execa";
import findVersions from "find-versions";
import { lt } from "semver";
import stripAnsi from "strip-ansi";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { NoNpmPackageManagerBinaryError } from "src/errors/NoNpmPackageManagerBinaryError";
import { UnsupportedNpmPackageManagerVersionError } from "src/errors/UnsupportedNpmPackageManagerVersionError";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export async function verifyNpmPackageManagerVersion(
  { env }: Pick<AnalyzeCommitsContext, "env">,
  { pm, pkg }: NpmPackageContext,
) {
  const minRequiredVersion = MIN_REQUIRED_PM_VERSIONS[pm.name];
  const { stdout } = await $({
    cwd: pm.root,
    env,
    lines: false,
  })`${pm.name} --version`.catch((error) => {
    const e = new NoNpmPackageManagerBinaryError(
      pkg,
      pm,
      `>=${minRequiredVersion}`,
    );

    e.cause = error;

    throw e;
  });

  const version = findVersions(stripAnsi(stdout), { loose: true })[0];

  if (lt(version, minRequiredVersion)) {
    throw new UnsupportedNpmPackageManagerVersionError(
      pkg,
      pm,
      `>=${minRequiredVersion}`,
      version,
    );
  }

  return version;
}
