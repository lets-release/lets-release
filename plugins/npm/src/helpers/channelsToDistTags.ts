import { validRange } from "semver";

export function channelsToDistTags(channels: (string | null)[]) {
  return channels.map((channel) =>
    channel ? (validRange(channel) ? `release-${channel}` : channel) : "latest",
  );
}
