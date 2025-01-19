import { z } from "zod";

import { ReleaseType } from "@lets-release/config";

export const ReleaseRule = z
  .object({
    release: z.union([
      z.enum(Object.values(ReleaseType) as [ReleaseType, ...ReleaseType[]]),
      z.literal(null),
    ]),
  })
  .passthrough();

export type ReleaseRule = z.infer<typeof ReleaseRule>;
