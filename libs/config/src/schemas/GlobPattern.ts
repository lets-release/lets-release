import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

export const GlobPattern = z.union([
  NonEmptyString,
  z.array(NonEmptyString).min(1),
]);

export type GlobPattern = z.infer<typeof GlobPattern>;
