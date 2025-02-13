import { $, ResultPromise } from "execa";

import { Step, StepFunction } from "@lets-release/config";

import { addChannel } from "src/helpers/addChannel";
import { channelsToDistTags } from "src/helpers/channelsToDistTags";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { getPackage } from "src/helpers/getPackage";
import { isVersionPublished } from "src/helpers/isVersionPublished";
import { preparePackage } from "src/helpers/preparePackage";
import { NpmOptions } from "src/schemas/NpmOptions";

export const publish: StepFunction<Step.publish, NpmOptions> = async (
  context,
  options,
) => {
  const { skipPublishing, tarballDir } = await NpmOptions.parseAsync(options);
  const {
    env,
    stdout,
    stderr,
    logger,
    package: { name, path: pkgRoot },
    nextRelease: { version, channels },
  } = context;
  const pkg = await getPackage(pkgRoot);
  const pkgContext = await ensureNpmPackageContext(context, {
    skipPublishing,
  });

  if (!pkgContext.prepared) {
    await preparePackage(context, pkgContext, { skipPublishing, tarballDir });
  }

  if (!skipPublishing && !pkg.private) {
    const { pm, registry } = pkgContext;
    const distTags = channelsToDistTags(channels);
    const isPublish = await isVersionPublished(context, pkgContext);

    const tag = distTags.find((tag) => tag === "latest") ?? distTags[0];
    const rest = distTags.filter((t) => t !== tag);

    if (isPublish) {
      logger.warn({
        prefix: `[${pkg.name}]`,
        message: `Skip publishing as version ${version} is already published`,
      });
    } else {
      logger.log({
        prefix: `[${pkg.name}]`,
        message: `Publishing version ${version} to npm registry on dist-tag ${tag}`,
      });

      const execaOptions = {
        cwd: pm.root,
        env,
        preferLocal: true as const,
      };

      let result: ResultPromise<typeof execaOptions>;

      switch (pm.name) {
        case "pnpm": {
          result = $(execaOptions)`pnpm publish ${pkgRoot} --tag ${tag}`;
          break;
        }

        case "yarn": {
          result = $(
            execaOptions,
          )`yarn workspace ${name} npm publish --tag ${tag}`;
          break;
        }

        default: {
          result = $(
            execaOptions,
          )`npm publish ${pkgRoot} --tag ${tag} --registry ${registry}`;
          break;
        }
      }

      result.stdout?.pipe(stdout, { end: false });
      result.stderr?.pipe(stderr, { end: false });

      await result;

      logger.log({
        prefix: `[${pkg.name}]`,
        message: `Published ${pkg.name}@${version} to dist-tag @${tag} on ${registry}`,
      });
    }

    for (const distTag of rest) {
      await addChannel(context, pkgContext, distTag);
    }

    return getArtifactInfo(context, pkgContext);
  }

  logger.log({
    prefix: `[${pkg.name}]`,
    message: `Skip publishing to npm registry as ${skipPublishing ? "skipPublishing" : "package.json's private property"} is true`,
  });
};
