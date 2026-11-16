import { mkdir, writeFile as nodeWriteFile } from "node:fs/promises";
import path from "node:path";

export async function writeFile(
  cwd: string,
  segments: string[],
  content = "Test file",
) {
  const file = path.resolve(cwd, ...segments);

  await mkdir(path.dirname(file), { recursive: true });
  await nodeWriteFile(file, content);
}
