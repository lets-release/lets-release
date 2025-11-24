import { Step, StepFunction } from "@lets-release/config";

import { NPM_PACKAGE_TYPE } from "src/constants/NPM_PACKAGE_TYPE";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { preparePackage } from "src/helpers/preparePackage";
import { NpmOptions } from "src/schemas/NpmOptions";

export const prepare: StepFunction<Step.prepare, NpmOptions> = async (
  context,
  options,
) => {
  if (context.package.type !== NPM_PACKAGE_TYPE) {
    return;
  }

  const parsedOptions = await NpmOptions.parseAsync(options);
  const pkgContext = await ensureNpmPackageContext(context, parsedOptions);
  await preparePackage(context, pkgContext, parsedOptions);
};
