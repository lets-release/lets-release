import { $, ResultPromise } from "execa";

import { VerifyReleaseContext } from "@lets-release/config";

import { NpmPackageContext } from "src/types/NpmPackageContext";

const isPublished = async (
  promise: ResultPromise<{
    preferLocal: true;
    reject: false;
  }>,
) => {
  const { exitCode, stdout } = await promise;

  // Yarn will fall back to latest version if the version is not found
  return exitCode === 0 && !stdout.includes("falling back");
};

export async function isVersionPublished(
  { env, package: { name }, nextRelease: { version } }: VerifyReleaseContext,
  { pm, cwd, registry }: NpmPackageContext,
) {
  const options = {
    cwd,
    env,
    preferLocal: true,
    reject: false,
  };

  switch (pm?.name) {
    case "pnpm": {
      return isPublished(
        $(options)`pnpm view ${`${name}@${version}`} --registry ${registry}`,
      );
    }

    case "yarn": {
      return isPublished($(options)`yarn npm info ${`${name}@${version}`}`);
    }

    default: {
      return isPublished(
        $(options)`npm view ${`${name}@${version}`} --registry ${registry}`,
      );
    }
  }
}
