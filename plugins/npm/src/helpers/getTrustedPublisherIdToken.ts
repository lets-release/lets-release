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

  // audience claim format (npm:your.registry.hostname)
  // see: https://github.com/npm/cli/pull/8336#issue-3101152098
  switch (publisher) {
    case TrustedPublisher.GITHUB_ACTIONS: {
      try {
        return await getIDToken(`npm:${host}`);
      } catch (error) {
        debug(`${name}:${uniqueName}`)(error);

        logger.warn({
          prefix: `[${uniqueName}]`,
          message: `Failed to retrieve GitHub Actions OIDC token for ${registry}`,
        });
      }

      return;
    }

    case TrustedPublisher.GITLAB_CI_CD_PIPELINES: {
      return process.env.NPM_ID_TOKEN;
    }
  }
}
