import { $, ResultPromise } from "execa";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { NeedAuthError } from "src/errors/NeedAuthError";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export async function verifyAuth(
  {
    env,
    package: { path: pkgRoot },
  }: Pick<AnalyzeCommitsContext, "env" | "package">,
  { pm, scope, registry }: NpmPackageContext,
) {
  const options = {
    cwd: pm.root,
    env,
    preferLocal: true as const,
  };

  const verify = async (promise: ResultPromise<typeof options>) => {
    try {
      await promise;
    } catch (error) {
      throw new AggregateError(
        [new NeedAuthError(registry), error],
        "AggregateError",
      );
    }
  };

  switch (pm?.name) {
    case "pnpm": {
      await verify(
        $({
          ...options,
          cwd: pkgRoot,
        })`pnpm whoami --registry ${registry}`,
      ).catch(
        async () =>
          await verify($(options)`pnpm whoami --registry ${registry}`),
      );
      break;
    }

    case "yarn": {
      await verify(
        $(
          options,
        )`yarn npm whoami --publish ${scope ? ["--scope", scope.replace(/^@/, "")] : []}`,
      );
      break;
    }

    default: {
      await verify($(options)`npm whoami --registry ${registry}`);
      break;
    }
  }
}
