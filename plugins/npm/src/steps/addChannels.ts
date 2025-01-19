import { Step, StepFunction } from "@lets-release/config";

import { addChannel } from "src/helpers/addChannel";
import { channelsToDistTags } from "src/helpers/channelsToDistTags";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { getPackage } from "src/helpers/getPackage";
import { NpmOptions } from "src/schemas/NpmOptions";

export const addChannels: StepFunction<Step.addChannels, NpmOptions> = async (
  context,
  options,
) => {
  const { skipPublishing } = await NpmOptions.parseAsync(options);
  const {
    logger,
    package: { path },
    nextRelease: { channels },
  } = context;
  const pkg = await getPackage(path);

  if (!skipPublishing && !pkg.private) {
    const pkgContext = await ensureNpmPackageContext(context, pkg, {
      skipPublishing,
    });
    const distTags = channelsToDistTags(channels);

    for (const distTag of distTags) {
      await addChannel(context, pkgContext, distTag);
    }

    return getArtifactInfo(context, pkgContext);
  }

  logger.log({
    prefix: `[${pkg.name}]`,
    message: `Skip adding to npm channel as ${skipPublishing ? "skipPublishing" : "package.json's private property"} is true`,
  });
};
