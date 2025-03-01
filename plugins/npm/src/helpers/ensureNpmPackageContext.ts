import { AnalyzeCommitsContext } from "@lets-release/config";

import { UnsupportedNpmPackageManagerError } from "src/errors/UnsupportedNpmPackageManagerError";
import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { verifyAuth } from "src/helpers/verifyAuth";
import { verifyNpmPackageManagerVersion } from "src/helpers/verifyNpmPackageManagerVersion";
import { NpmOptions } from "src/schemas/NpmOptions";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export async function ensureNpmPackageContext(
  context: Pick<
    AnalyzeCommitsContext,
    | "env"
    | "repositoryRoot"
    | "package"
    | "getPluginPackageContext"
    | "setPluginPackageContext"
  >,
  { skipPublishing }: Pick<NpmOptions, "skipPublishing">,
): Promise<NpmPackageContext> {
  const {
    package: { uniqueName },
    getPluginPackageContext,
    setPluginPackageContext,
  } = context;

  const pkgContext =
    getPluginPackageContext<NpmPackageContext>() ??
    (await getNpmPackageContext(context));

  if (!pkgContext) {
    throw new UnsupportedNpmPackageManagerError(uniqueName);
  }

  // Verify the npm authentication only if `skipPublishing` is not `true` and `pkg.private` is not `true`
  if (!pkgContext.verified && !skipPublishing && !pkgContext.pkg.private) {
    await verifyNpmPackageManagerVersion(context, pkgContext);
    await verifyAuth(context, pkgContext);
  }

  const verifiedPkgContext = {
    ...pkgContext,
    verified: true,
  };

  setPluginPackageContext<NpmPackageContext>(verifiedPkgContext);

  return verifiedPkgContext;
}
