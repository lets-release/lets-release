import { template } from "lodash-es";

import { Channel } from "@lets-release/config";

export function mapChannel(name: string, channel: Channel): Channel {
  return channel ? template(channel)({ name }) : channel;
}
