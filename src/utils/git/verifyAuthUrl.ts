import { debug } from "debug";
import { Options } from "execa";

import { name } from "src/program";
import { verifyAuth } from "src/utils/git/verifyAuth";

/**
 * Verify authUrl by calling git.verifyAuth, but don't throw on failure
 *
 * @param context lets-release base context.
 * @param authURL Repository URL to verify
 * @param options Options to pass to `execa`.
 *
 * @return The authUrl as is if the connection was successful, null otherwise
 */
export async function verifyAuthUrl(
  url: string,
  branch: string,
  options: Partial<Options> = {},
) {
  try {
    await verifyAuth(url, branch, options);

    return url;
  } catch (error) {
    debug(`${name}:utils.git.verifyAuthUrl`)(error);

    return null;
  }
}
