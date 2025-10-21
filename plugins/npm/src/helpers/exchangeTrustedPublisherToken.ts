import debug from "debug";
import { fetch } from "undici";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { name } from "src/plugin";
import { NpmPackageContext } from "src/types/NpmPackageContext";

// inspired by https://github.com/semantic-release/npm/issues/958
export async function exchangeTrustedPublisherToken(
  {
    logger,
    package: { name: pkgName, uniqueName },
  }: Pick<AnalyzeCommitsContext, "logger" | "package">,
  { registry }: Pick<NpmPackageContext, "registry">,
  idToken: string,
) {
  const namespace = `${name}:${uniqueName}`;

  try {
    const response = await fetch(
      `${new URL(registry).origin}/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(pkgName)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      },
    );
    const json = await response.json();

    if (response.ok) {
      return (json as { token: string }).token;
    }

    debug(namespace)(
      `Failed to exchange OIDC token with ${registry}: ${response.status} ${(json as { message: string }).message}`,
    );
  } catch (error) {
    debug(namespace)(`Failed to exchange OIDC token with ${registry}`);
    debug(namespace)(error);
  }

  logger.warn({
    prefix: `[${uniqueName}]`,
    message: `Failed to exchange OIDC token with ${registry}`,
  });
}
