import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { Channel } from "src/schemas/Channel";

/**
 * The distribution channels.
 *
 * If set as an record, the key is the plugin name or `default`.
 */
export const Channels = z.union([
  z.array(Channel).min(1),
  z.record(NonEmptyString, z.array(Channel).min(1).optional()),
]);

export type Channels = z.infer<typeof Channels>;

export type NormalizedChannels = Record<string, Channel[] | undefined> & {
  default: Channel[];
};
