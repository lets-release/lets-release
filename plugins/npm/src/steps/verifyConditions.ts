import { Step, StepFunction } from "@lets-release/config";

import { NPM_PACKAGE_TYPE } from "src/constants/NPM_PACKAGE_TYPE";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { NpmOptions } from "src/schemas/NpmOptions";

export const verifyConditions: StepFunction<
  Step.verifyConditions,
  NpmOptions
> = async (context, options) => {
  const parsedOptions = await NpmOptions.parseAsync(options);

  for (const pkg of context.packages) {
    if (pkg.type === NPM_PACKAGE_TYPE) {
      await ensureNpmPackageContext(
        {
          ...context,
          package: pkg,
          getPluginPackageContext: () =>
            context.getPluginPackageContext(pkg.type, pkg.name),
          setPluginPackageContext: (pkgContext) =>
            context.setPluginPackageContext(pkg.type, pkg.name, pkgContext),
        },
        parsedOptions,
      );
    }
  }
};
