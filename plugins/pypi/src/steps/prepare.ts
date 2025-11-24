import { Step, StepFunction } from "@lets-release/config";

import { PYPI_PACKAGE_TYPE } from "src/constants/PYPI_PACKAGE_TYPE";
import { ensurePyPIPackageContext } from "src/helpers/ensurePyPIPackageContext";
import { preparePackage } from "src/helpers/preparePackage";
import { PyPIOptions } from "src/schemas/PyPIOptions";

export const prepare: StepFunction<Step.prepare, PyPIOptions> = async (
  context,
  options,
) => {
  if (context.package.type !== PYPI_PACKAGE_TYPE) {
    return;
  }

  const parsedOptions = await PyPIOptions.parseAsync(options);
  const pkgContext = await ensurePyPIPackageContext(context, parsedOptions);
  await preparePackage(context, pkgContext, parsedOptions);
};
