import { Step, StepFunction } from "@lets-release/config";

import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getPackage } from "src/helpers/getPackage";
import { preparePackage } from "src/helpers/preparePackage";
import { NpmOptions } from "src/schemas/NpmOptions";

export const prepare: StepFunction<Step.prepare, NpmOptions> = async (
  context,
  options,
) => {
  const parsedOptions = await NpmOptions.parseAsync(options);
  const pkg = await getPackage(context.package.path);
  const pkgContext = await ensureNpmPackageContext(context, pkg, parsedOptions);
  await preparePackage(context, pkgContext, parsedOptions);
};
