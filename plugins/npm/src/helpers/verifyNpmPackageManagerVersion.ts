import { $ } from "execa";
import findVersions from "find-versions";
import { lt } from "semver";
import stripAnsi from "strip-ansi";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { NoNpmPackageManagerBinaryError } from "src/errors/NoNpmPackageManagerBinaryError";
import { UnsupportedNpmPackageManagerVersionError } from "src/errors/UnsupportedNpmPackageManagerVersionError";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const minRequiredVersions = {
  pnpm: "8.0.0",
  yarn: "3.0.0",
  npm: "8.5.0",
};

export async function verifyNpmPackageManagerVersion(
  { env }: Pick<AnalyzeCommitsContext, "env">,
  { pm, pkg }: NpmPackageContext,
) {
  const minRequiredVersion = minRequiredVersions[pm.name];
  const { stdout } = await $({
    cwd: pm.root,
    env,
    lines: false,
  })`${pm.name} --version`.catch((error) => {
    throw new AggregateError(
      [
        new NoNpmPackageManagerBinaryError(pkg, pm, `>=${minRequiredVersion}`),
        error,
      ],
      "AggregateError",
    );
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
}
