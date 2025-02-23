import { Step, StepFunction } from "@lets-release/config";

import { addChannel } from "src/helpers/addChannel";
import { channelsToDistTags } from "src/helpers/channelsToDistTags";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { NpmOptions } from "src/schemas/NpmOptions";

export const addChannels: StepFunction<Step.addChannels, NpmOptions> = async (
  context,
  options,
) => {
  const { skipPublishing } = await NpmOptions.parseAsync(options);
  const {
    logger,
    package: { uniqueName },
    nextRelease: { channels },
  } = context;
  const pkgContext = await ensureNpmPackageContext(context, {
    skipPublishing,
  });

  if (!skipPublishing && !pkgContext.pkg.private) {
    const distTags = channelsToDistTags(channels);

    for (const distTag of distTags) {
      await addChannel(context, pkgContext, distTag);
    }

    return getArtifactInfo(context, pkgContext);
  }

  logger.log({
    prefix: `[${uniqueName}]`,
    message: `Skip adding to npm channel as ${skipPublishing ? "skipPublishing" : "package.json's private property"} is true`,
  });
};
