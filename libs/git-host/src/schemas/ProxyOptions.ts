import { z } from "zod";

import { NonEmptyString } from "@lets-release/config";

export const ProxyOptions = z.union([
  z.literal(false),
  NonEmptyString,
  z.instanceof(URL),
  z
    .object({
      uri: NonEmptyString,
    })
    .passthrough(),
]);

export type ProxyOptions = z.infer<typeof ProxyOptions>;
