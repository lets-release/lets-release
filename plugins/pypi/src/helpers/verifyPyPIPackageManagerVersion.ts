import { $ } from "execa";
import findVersions from "find-versions";
import { lt } from "semver";
import stripAnsi from "strip-ansi";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { NoPyPIPackageManagerBinaryError } from "src/errors/NoPyPIPackageManagerBinaryError";
import { UnsupportedPyPIPackageManagerVersionError } from "src/errors/UnsupportedPyPIPackageManagerVersionError";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

export async function verifyPyPIPackageManagerVersion(
  { env }: Pick<AnalyzeCommitsContext, "env">,
  { pm, pkg }: PyPIPackageContext,
) {
  const minRequiredVersion = MIN_REQUIRED_PM_VERSIONS[pm.name];
  const { stdout } = await $({
    cwd: pm.root,
    env,
    lines: false,
  })`${pm.name} --version`.catch((error) => {
    throw new AggregateError(
      [
        new NoPyPIPackageManagerBinaryError(pkg, pm, `>=${minRequiredVersion}`),
        error,
      ],
      "AggregateError",
    );
  });

  const version = findVersions(stripAnsi(stdout), { loose: true })[0];

  if (lt(version, minRequiredVersion)) {
    throw new UnsupportedPyPIPackageManagerVersionError(
      pkg,
      pm,
      `>=${minRequiredVersion}`,
      version,
    );
  }

  return version;
}
