import { Octokit } from "@octokit/core";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";

import { OCTOKIT_MAX_RETRIES } from "src/constants/OCTOKIT_MAX_RETRIES";
import { handleRateLimit } from "src/helpers/handleRateLimit";
import { version } from "src/plugin";

export const LetsReleaseOctokit = Octokit.plugin(
  paginateRest,
  retry,
  throttling,
).defaults({
  userAgent: `@let-release/github v${version}`,
  retry: {
    // By default, Octokit does not retry on 404s.
    // But we want to retry on 404s to account for replication lag.
    doNotRetry: [400, 401, 403, 422],
    retries: OCTOKIT_MAX_RETRIES,
  },
  throttle: {
    onRateLimit: handleRateLimit,
    onSecondaryRateLimit: handleRateLimit,
  },
});

export type LetsReleaseOctokit = InstanceType<typeof LetsReleaseOctokit>;
