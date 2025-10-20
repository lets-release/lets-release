import { getIDToken } from "@actions/core";
import debug from "debug";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { TrustedPublisher } from "src/enums/TrustedPublisher";
import { name } from "src/plugin";
import { NpmPackageContext } from "src/types/NpmPackageContext";

// inspired by https://github.com/semantic-release/npm/issues/958
export async function getTrustedPublisherIdToken(
  {
    ciEnv,
    logger,
    package: { uniqueName },
  }: Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">,
  { registry }: Pick<NpmPackageContext, "registry">,
) {
  const { name: publisher } = ciEnv as { name?: string };
  const host = new URL(registry).host;

  switch (publisher) {
    case TrustedPublisher.GitHub_Actions: {
      try {
        return await getIDToken(`npm:${host}`);
      } catch (error) {
        debug(`${name}:${uniqueName}`)(error);

        logger.warn({
          prefix: `[${uniqueName}]`,
          message: `Failed to retrieve GitHub Actions OIDC token for ${host}`,
        });
      }

      return;
    }

    case TrustedPublisher.GitLab_CI_CD_PIPELINES: {
      return process.env.NPM_ID_TOKEN;
    }
  }
}
