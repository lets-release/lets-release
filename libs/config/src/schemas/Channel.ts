import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

/**
 * The distribution channel.
 *
 * If `channel` is `null`, the branch will be released on the default
 * distribution channel (e.g., the `@latest` [dist-tag][] for npm).
 *
 * If `channel` is a string, then the channel name is generated using
 * [Lodash template][] with the variable `name` set to the branch name
 * (only the `range` part for maintenance branches). For example,
 * `{name: 'next', channels: ['channel-${name}']}` will be expanded to
 * `{name: 'next', channels: ['channel-next']}`.
 *
 * [dist-tag]: https://docs.npmjs.com/cli/dist-tag
 * [Lodash template]: https://lodash.com/docs#template
 */
export const Channel = z.union([z.literal(null), NonEmptyString]);

export type Channel = z.infer<typeof Channel>;
