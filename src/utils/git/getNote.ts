import { debug } from "debug";
import { $, ExecaError, Options } from "execa";
import { merge } from "lodash-es";

import { name } from "src/program";
import { TagNote } from "src/types/TagNote";

const handleError = (error: ExecaError) => {
  if (error.exitCode === 1) {
    return { stdout: "{}" };
  }

  throw error;
};

/**
 * Get and parse the JSON note of a given reference.
 *
 * @param ref The Git reference for which to retrieve the note.
 * @param options Options to pass to `execa`.
 *
 * @return the parsed JSON note if there is one, an empty object otherwise.
 */
export async function getNote(
  ref: string,
  options: Partial<Omit<Options, "lines">> = {},
): Promise<TagNote> {
  try {
    const { stdout: stdoutA } = await $<{ lines: false }>({
      ...options,
      lines: false,
    })`git notes --ref ${name} show ${ref}`.catch(handleError);
    const { stdout: stdoutB } = await $<{ lines: false }>({
      ...options,
      lines: false,
    })`git notes --ref ${`${name}-${ref}`} show ${ref}`.catch(handleError);

    return merge(
      JSON.parse(stdoutA.trim()),
      JSON.parse(stdoutB.trim()),
    ) as TagNote;
  } catch (error: unknown) {
    debug(`${name}:utils.git.getNote`)(error);

    throw error;
  }
}
