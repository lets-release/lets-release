import { getIDToken } from "@actions/core";
import debug from "debug";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { TrustedPublisher } from "src/enums/TrustedPublisher";
import { name } from "src/plugin";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

// https://docs.pypi.org/trusted-publishers/using-a-publisher
export async function getTrustedPublisherIdToken(
  {
    ciEnv,
    logger,
    package: { uniqueName },
  }: Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">,
  { registry }: Pick<PyPIPackageContext, "registry">,
) {
  const { name: publisher } = ciEnv as { name?: string };
  const publishUrl = new URL(registry.publishUrl);

  const response = await fetch(`${publishUrl.origin}/_/oidc/audience`);

  if (!response.ok) {
    return;
  }

  let audience: string | undefined = undefined;

  try {
    const json = (await response.json()) as { audience?: unknown };

    if (typeof json.audience === "string") {
      audience = json.audience;
    }
  } catch {
    return;
  }

  if (!audience) {
    return;
  }

  switch (publisher) {
    case TrustedPublisher.GITHUB_ACTIONS: {
      try {
        return await getIDToken(audience);
      } catch (error) {
        debug(`${name}:${uniqueName}`)(error);

        logger.warn({
          prefix: `[${uniqueName}]`,
          message: `Failed to retrieve GitHub Actions OIDC token for ${registry.publishUrl}`,
        });
      }

      return;
    }

    case TrustedPublisher.GITLAB_CI_CD_PIPELINES: {
      return process.env.NPM_ID_TOKEN;
    }
  }
}
