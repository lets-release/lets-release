import { $, Options } from "execa";
import normalizeUrl from "normalize-url";
import stripAnsi from "strip-ansi";

export async function getPoetryRegistries(
  options: Partial<Options> = {},
): Promise<{ name: string; publishUrl: string }[]> {
  const { stdout } = await $<{ lines: true }>({
    ...options,
    lines: true,
  })`poetry config --list`;

  const entries: { name: string; publishUrl?: string }[] = [];

  for (const line of stdout) {
    const trimmed = stripAnsi(line).trim();
    const [key = "", ...rest] = trimmed.split(" = ");
    const keyTrimmed = key.trim();

    // Format: repositories.<name>.url = "<url>"
    const urlMatch = /^repositories\.(.+)\.url$/i.exec(keyTrimmed);

    if (urlMatch) {
      entries.push({ name: urlMatch[1] });
      continue;
    }

    // Format: repositories.<name> = {"url": "<url>"}
    const nameMatch = /^repositories\.(.+)$/i.exec(keyTrimmed);

    if (nameMatch) {
      const value = rest.join(" = ").trim();

      try {
        const parsed: unknown = JSON.parse(value);

        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "url" in parsed &&
          typeof parsed.url === "string"
        ) {
          entries.push({
            name: nameMatch[1],
            publishUrl: normalizeUrl(parsed.url.trim()),
          });
        }
      } catch {
        // not valid JSON, skip
      }
    }
  }

  return await Promise.all(
    entries.map(async (entry) => {
      if (entry.publishUrl) {
        return { name: entry.name, publishUrl: entry.publishUrl };
      }

      const { stdout } = await $<{ lines: false }>({
        ...options,
        lines: false,
      })`poetry config ${`repositories.${entry.name}.url`}`;

      return {
        name: entry.name,
        publishUrl: normalizeUrl(stripAnsi(stdout).trim()),
      };
    }),
  );
}
