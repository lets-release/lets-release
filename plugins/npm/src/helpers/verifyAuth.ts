import { $, ResultPromise } from "execa";

import { VerifyConditionsContext } from "@lets-release/config";

import { NeedAuthError } from "src/errors/NeedAuthError";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export async function verifyAuth(
  { env }: VerifyConditionsContext,
  { pm, cwd, scope, registry }: NpmPackageContext,
) {
  const options = {
    cwd,
    env,
    preferLocal: true as const,
  };

  const verify = async (promise: ResultPromise<typeof options>) => {
    try {
      await promise;
    } catch {
      throw new AggregateError([new NeedAuthError(registry)], "AggregateError");
    }
  };

  switch (pm?.name) {
    case "pnpm": {
      await verify($(options)`pnpm whoami --registry ${registry}`);
      break;
    }

    case "yarn": {
      await verify(
        $(
          options,
        )`yarn npm whoami ${scope ? ["--scope", scope.replace(/^@/, "")] : []}`,
      );
      break;
    }

    default: {
      await verify($(options)`npm whoami --registry ${registry}`);
      break;
    }
  }
}
