import { $ } from "execa";
import findVersions from "find-versions";
import { lt } from "semver";

import { NoGitBinaryError } from "src/errors/NoGitBinaryError";
import { UnsupportedGitVersionError } from "src/errors/UnsupportedGitVersionError";

const minRequiredVersion = "2.7.1";

export async function verifyGitVersion() {
  const { stdout } = await $`git --version`.catch((error) => {
    throw new AggregateError(
      [new NoGitBinaryError(`>=${minRequiredVersion}`), error],
      "AggregateError",
    );
  });

  const version = findVersions(stdout, { loose: true })[0];

  if (lt(version, minRequiredVersion)) {
    throw new UnsupportedGitVersionError(`>=${minRequiredVersion}`, version);
  }
}
