import { isArray } from "lodash-es";

import { Channel, Channels, NormalizedChannels } from "@lets-release/config";

import { mapChannel } from "src/utils/branch/mapChannel";

export function normalizeChannels(
  name: string,
  defaults: Channel[],
  channels?: Channels,
): NormalizedChannels {
  if (!channels) {
    return { default: defaults };
  }

  if (isArray(channels)) {
    if (channels.length === 0) {
      return { default: defaults };
    }

    return {
      default: channels.map((channel) => mapChannel(name, channel)),
    };
  }

  const mappedChannels = Object.fromEntries(
    Object.entries(channels).map(([key, value]) => [
      key,
      value && value.length > 0
        ? value.map((channel) => mapChannel(name, channel))
        : defaults,
    ]),
  );

  return { ...mappedChannels, default: mappedChannels.default ?? defaults };
}
