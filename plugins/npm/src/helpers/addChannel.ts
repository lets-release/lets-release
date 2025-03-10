import { $, ResultPromise } from "execa";
import { gt } from "semver";

import { VerifyReleaseContext } from "@lets-release/config";

import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
import { getDistTagVersion } from "src/helpers/getDistTagVersion";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export async function addChannel(
  context: VerifyReleaseContext,
  pkgContext: NpmPackageContext,
  distTag: string,
) {
  const {
    env,
    stdout,
    stderr,
    logger,
    package: { name, uniqueName },
    nextRelease: { version },
  } = context;
  const distTagVersion = await getDistTagVersion(context, pkgContext, distTag);

  if (!distTagVersion || gt(version, distTagVersion)) {
    logger.log({
      prefix: `[${uniqueName}]`,
      message: `Adding version ${version} to npm registry on dist-tag ${distTag}`,
    });

    const { pm, registry } = pkgContext;
    const options = {
      cwd: pm.root,
      env,
      preferLocal: true,
    };
    const addDistTag = async (promise: ResultPromise) => {
      promise.stdout?.pipe(stdout, { end: false });
      promise.stderr?.pipe(stderr, { end: false });

      await promise;
    };

    switch (pm.name) {
      case NpmPackageManagerName.pnpm: {
        await addDistTag(
          $(
            options,
          )`pnpm dist-tag add ${`${name}@${version}`} ${distTag} --registry ${registry}`,
        );
        break;
      }

      case NpmPackageManagerName.yarn: {
        await addDistTag(
          $(options)`yarn npm tag add ${`${name}@${version}`} ${distTag}`,
        );
        break;
      }

      // npm
      default: {
        await addDistTag(
          $(
            options,
          )`npm dist-tag add ${`${name}@${version}`} ${distTag} --registry ${registry}`,
        );
        break;
      }
    }

    logger.log({
      prefix: `[${uniqueName}]`,
      message: `Added ${name}@${version} to dist-tag @${distTag} on ${registry}`,
    });
  } else {
    logger.warn({
      prefix: `[${uniqueName}]`,
      message: `Skip adding channel ${distTag} as a later version is already in the channel`,
    });
  }
}
