import { mkdir, writeFile as nodeWriteFile } from "node:fs/promises";
import path from "node:path";

export async function writeFile(
  cwd: string,
  segments: string[],
  content?: string,
) {
  const file = path.resolve(cwd, ...segments);

  await mkdir(path.dirname(file), { recursive: true });
  await nodeWriteFile(file, content ?? "Test file");
}
