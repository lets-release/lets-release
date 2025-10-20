import { $, ResultPromise } from "execa";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
import { NeedAuthError } from "src/errors/NeedAuthError";
import { exchangeTrustedPublisherToken } from "src/helpers/exchangeTrustedPublisherToken";
import { getTrustedPublisherIdToken } from "src/helpers/getTrustedPublisherIdToken";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export async function verifyAuth(
  {
    ciEnv,
    env,
    logger,
    package: pkg,
  }: Pick<AnalyzeCommitsContext, "ciEnv" | "env" | "logger" | "package">,
  { pm, scope, registry }: NpmPackageContext,
) {
  const idToken = await getTrustedPublisherIdToken(
    { ciEnv, logger, package: pkg },
    { registry },
  );

  if (idToken) {
    const token = await exchangeTrustedPublisherToken(
      { logger, package: pkg },
      { registry },
      idToken,
    );

    if (token) {
      return;
    }
  }

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
    case NpmPackageManagerName.pnpm: {
      await verify(
        $({
          ...options,
          cwd: pkg.path,
        })`pnpm whoami --registry ${registry}`,
      ).catch(
        async () =>
          await verify($(options)`pnpm whoami --registry ${registry}`),
      );
      break;
    }

    case NpmPackageManagerName.yarn: {
      await verify(
        $(
          options,
        )`yarn npm whoami --publish ${scope ? ["--scope", scope.replace(/^@/, "")] : []}`,
      );
      break;
    }

    // npm
    default: {
      await verify($(options)`npm whoami --registry ${registry}`);
      break;
    }
  }
}
