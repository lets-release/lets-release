import { AnalyzeCommitsContext } from "@lets-release/config";

import { PYPI_PRIVATE_CLASSIFIER_PREFIX } from "src/constants/PYPI_PRIVATE_CLASSIFIER_PREFIX";
import { UnsupportedPyPIPackageManagerError } from "src/errors/UnsupportedPyPIPackageManagerError";
import { getPyPIPackageContext } from "src/helpers/getPyPIPackageContext";
import { verifyAuth } from "src/helpers/verifyAuth";
import { verifyPyPIPackageManagerVersion } from "src/helpers/verifyPyPIPackageManagerVersion";
import { PyPIOptions } from "src/schemas/PyPIOptions";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

export async function ensurePyPIPackageContext(
  context: Pick<
    AnalyzeCommitsContext,
    | "env"
    | "repositoryRoot"
    | "package"
    | "getPluginPackageContext"
    | "setPluginPackageContext"
  >,
  { skipPublishing }: Pick<PyPIOptions, "skipPublishing">,
): Promise<PyPIPackageContext> {
  const {
    package: { uniqueName },
    getPluginPackageContext,
    setPluginPackageContext,
  } = context;

  const pkgContext =
    getPluginPackageContext<PyPIPackageContext>() ??
    (await getPyPIPackageContext(context));

  if (!pkgContext) {
    throw new UnsupportedPyPIPackageManagerError(uniqueName);
  }

  // Verify the authentication only if `skipPublishing` is not `true`,
  // and `pkg.project.classifiers` does not include classifier beginning with "Private ::"
  if (
    !pkgContext.verified &&
    !skipPublishing &&
    !pkgContext.pkg.project.classifiers?.some((classifier) =>
      classifier.startsWith(PYPI_PRIVATE_CLASSIFIER_PREFIX),
    )
  ) {
    await verifyPyPIPackageManagerVersion(context, pkgContext);
    await verifyAuth(context, pkgContext);
  }

  const verifiedPkgContext = {
    ...pkgContext,
    verified: true,
  };

  setPluginPackageContext<PyPIPackageContext>(verifiedPkgContext);

  return verifiedPkgContext;
}
