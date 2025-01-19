import { Step, StepFunction } from "@lets-release/config";

import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getPackage } from "src/helpers/getPackage";
import { NpmOptions } from "src/schemas/NpmOptions";

export const verifyConditions: StepFunction<
  Step.verifyConditions,
  NpmOptions
> = async (context, options) => {
  const parsedOptions = await NpmOptions.parseAsync(options);

  // Verify the npm authentication only if `skipPublishing` is not true
  if (!parsedOptions.skipPublishing) {
    const { packages } = context;

    for (const pkg of packages) {
      await ensureNpmPackageContext(
        { ...context, package: pkg },
        await getPackage(pkg.path),
        parsedOptions,
      );
    }
  }
};
