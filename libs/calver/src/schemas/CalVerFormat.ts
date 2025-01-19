import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { isValidCalVerFormat } from "src/helpers/isValidCalVerFormat";

/**
 * Calendar versioning format.
 */
export const CalVerFormat = NonEmptyString.superRefine((val, ctx) => {
  if (!isValidCalVerFormat(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid calendar versioning format.",
    });
  }
});

export type CalVerFormat = z.infer<typeof CalVerFormat>;
