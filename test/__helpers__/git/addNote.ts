import { $ } from "execa";

import { Artifact } from "@lets-release/config";

import { name } from "src/program";

export async function addNote(cwd: string, ref: string, artifacts: Artifact[]) {
  await $({
    cwd,
  })`git notes --ref ${`${name}-${ref}`} add -f -m ${JSON.stringify({ artifacts })} ${ref}`;
}
