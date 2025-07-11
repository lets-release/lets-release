import { Step, StepFunction } from "@lets-release/config";

import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { NpmOptions } from "src/schemas/NpmOptions";

export const verifyConditions: StepFunction<
  Step.verifyConditions,
  NpmOptions
> = async (context, options) => {
  const parsedOptions = await NpmOptions.parseAsync(options);

  for (const pkg of context.packages) {
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
};
