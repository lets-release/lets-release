import { $, Options } from "execa";
import findVersions from "find-versions";
import { lt } from "semver";
import stripAnsi from "strip-ansi";

import { NoGitBinaryError } from "src/errors/NoGitBinaryError";
import { UnsupportedGitVersionError } from "src/errors/UnsupportedGitVersionError";

const minRequiredVersion = "2.7.1";

export async function verifyGitVersion(options: Partial<Options> = {}) {
  const { stdout } = await $<{ lines: false }>({
    ...options,
    lines: false,
  })`git --version`.catch((error) => {
    const e = new NoGitBinaryError(`>=${minRequiredVersion}`);

    e.cause = error;

    throw e;
  });

  const version = findVersions(stripAnsi(stdout), { loose: true })[0];

  if (lt(version, minRequiredVersion)) {
    throw new UnsupportedGitVersionError(`>=${minRequiredVersion}`, version);
  }
}
