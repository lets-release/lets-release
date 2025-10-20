import debug from "debug";
import { fetch } from "undici";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { name } from "src/plugin";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

// inspired by https://github.com/semantic-release/npm/issues/958
export async function exchangeTrustedPublisherToken(
  {
    logger,
    package: { uniqueName },
  }: Pick<AnalyzeCommitsContext, "logger" | "package">,
  { registry }: Pick<PyPIPackageContext, "registry">,
  idToken: string,
) {
  const response = await fetch(
    `${new URL(registry.publishUrl).origin}/_/oidc/mint-token`,
    {
      method: "POST",
      body: JSON.stringify({
        token: idToken,
      }),
    },
  );
  const json = await response.json();

  if (response.ok) {
    return (json as { token: string }).token;
  }

  debug(`${name}:${uniqueName}`)(
    `Failed to exchange OIDC token with ${registry.publishUrl}: ${response.status} ${(json as { message: string }).message}`,
  );

  logger.warn({
    prefix: `[${uniqueName}]`,
    message: `Failed to exchange OIDC token with ${registry.publishUrl}`,
  });
}
