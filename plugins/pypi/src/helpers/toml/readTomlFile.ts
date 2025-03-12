import { readFile } from "node:fs/promises";

import { parse } from "smol-toml";

export async function readTomlFile(file: string) {
  return parse(await readFile(file, "utf8"));
}
