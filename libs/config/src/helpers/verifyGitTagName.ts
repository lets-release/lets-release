import { $, Options } from "execa";

/**
 * Verify a tag name is a valid Git reference.
 *
 * @param tag the tag name to verify.
 * @param options Options to pass to `execa`.
 *
 * @return `true` if valid, falsy otherwise.
 */
export async function verifyGitTagName(
  tag: string,
  options: Partial<Options> = {},
) {
  const { exitCode } = await $({
    ...options,
    reject: false,
  })`git check-ref-format ${`refs/tags/${tag}`}`;

  return exitCode === 0;
}
