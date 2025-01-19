import { uniq } from "lodash-es";

import { Channel } from "@lets-release/config";

export function mergeChannels(
  channels: Record<string, Channel[] | undefined>,
  anotherChannels: Record<string, Channel[] | undefined>,
): Record<string, Channel[] | undefined> {
  return Object.fromEntries(
    uniq([...Object.keys(channels), ...Object.keys(anotherChannels)]).map(
      (key) => [
        key,
        uniq([...(channels[key] ?? []), ...(anotherChannels[key] ?? [])]),
      ],
    ),
  );
}
