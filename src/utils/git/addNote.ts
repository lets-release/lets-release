import { $, Options } from "execa";

import { name } from "src/program";
import { TagNote } from "src/types/TagNote";

/**
 * Add JSON note to a given reference.
 *
 * @param note The object to save in the reference note.
 * @param ref The Git reference to add the note to.
 * @param options Options to pass to `execa`.
 */
export async function addNote(
  ref: string,
  note: TagNote,
  options: Partial<Options> = {},
) {
  await $(
    options,
  )`git notes --ref ${`${name}-${ref}`} add -f -m ${JSON.stringify(note)} ${ref}`;
}
