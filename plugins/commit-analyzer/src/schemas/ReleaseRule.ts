import { z } from "zod";

import { ReleaseType } from "@lets-release/config";

export const ReleaseRule = z.looseObject({
  release: z.union([
    z.enum(Object.values(ReleaseType) as [ReleaseType, ...ReleaseType[]]),
    z.literal(null),
  ]),
});

export type ReleaseRule = z.infer<typeof ReleaseRule>;
