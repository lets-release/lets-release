import { Step, StepFunction } from "@lets-release/config";

import { ensurePyPIPackageContext } from "src/helpers/ensurePyPIPackageContext";
import { PyPIOptions } from "src/schemas/PyPIOptions";

export const verifyConditions: StepFunction<
  Step.verifyConditions,
  PyPIOptions
> = async (context, options) => {
  const parsedOptions = await PyPIOptions.parseAsync(options);

  for (const pkg of context.packages) {
    await ensurePyPIPackageContext(
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
