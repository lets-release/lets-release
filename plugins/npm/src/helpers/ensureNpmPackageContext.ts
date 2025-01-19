import path from "node:path";

import { findUp } from "find-up-simple";
// eslint-disable-next-line import-x/default
import preferredPM from "preferred-pm";
import { NormalizedPackageJson } from "read-pkg";

import {
  VerifyConditionsContext,
  VerifyReleaseContext,
} from "@lets-release/config";

import { getRegistry } from "src/helpers/getRegistry";
import { verifyAuth } from "src/helpers/verifyAuth";
import { NpmOptions } from "src/schemas/NpmOptions";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export async function ensureNpmPackageContext(
  context: VerifyConditionsContext & Pick<VerifyReleaseContext, "package">,
  pkg: NormalizedPackageJson,
  { skipPublishing }: Pick<NpmOptions, "skipPublishing">,
): Promise<NpmPackageContext> {
  const {
    repositoryRoot,
    package: { path: pkgRoot },
    getPluginPackageContext,
    setPluginPackageContext,
  } = context;

  const pkgContext = getPluginPackageContext<NpmPackageContext>();

  if (pkgContext) {
    return pkgContext;
  }

  const pm = await preferredPM(pkgRoot);

  const findRcFile = async () => {
    const options = { cwd: pkgRoot, stopAt: path.dirname(repositoryRoot) };

    if (pm?.name === "yarn") {
      return (
        (await findUp(".yarnrc.yml", options)) ??
        (await findUp(".yarnrc", options))
      );
    }

    return await findUp(".npmrc", options);
  };

  const rcFile = await findRcFile();
  const cwd = rcFile ? path.dirname(rcFile) : pkgRoot;
  const [pkgScope] = pkg.name.split("/");
  const scope = pkgScope.startsWith("@") ? pkgScope : undefined;
  const registry = await getRegistry(context, pkg, { pm, cwd, scope });
  const newPkgContext = {
    pm,
    cwd,
    scope,
    registry,
  };

  // Verify the npm authentication only if `skipPublishing` is not `true` and `pkg.private` is not `true`
  if (!skipPublishing && !pkg.private) {
    await verifyAuth(context, newPkgContext);
  }

  setPluginPackageContext<NpmPackageContext>(newPkgContext);

  return newPkgContext;
}
