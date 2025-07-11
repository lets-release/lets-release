import { z } from "zod";

import { NonEmptyString } from "@lets-release/config";

export const ProxyOptions = z.union([
  z.literal(false),
  NonEmptyString,
  z.instanceof(URL),
  z.looseObject({
    uri: NonEmptyString,
  }),
]);

export type ProxyOptions = z.infer<typeof ProxyOptions>;
