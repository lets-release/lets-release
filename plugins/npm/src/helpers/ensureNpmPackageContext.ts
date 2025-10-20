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
    | "ciEnv"
    | "env"
    | "logger"
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

  let pmVersion: string | undefined = undefined;

  if (!pkgContext.verified) {
    pmVersion = await verifyNpmPackageManagerVersion(context, pkgContext);

    // Verify the npm authentication only if `skipPublishing` is not `true` and `pkg.private` is not `true`
    if (!skipPublishing && !pkgContext.pkg.private) {
      await verifyAuth(context, pkgContext);
    }
  }

  const verifiedPkgContext = {
    ...pkgContext,
    pm: pmVersion ? { ...pkgContext.pm, version: pmVersion } : pkgContext.pm,
    verified: true,
  };

  setPluginPackageContext<NpmPackageContext>(verifiedPkgContext);

  return verifiedPkgContext;
}
