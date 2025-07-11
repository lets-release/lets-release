import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { isValidCalVerFormat } from "src/helpers/isValidCalVerFormat";

/**
 * Calendar versioning format.
 */
export const CalVerFormat = NonEmptyString.check((ctx) => {
  if (!isValidCalVerFormat(ctx.value)) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message: "Invalid calendar versioning format.",
    });
  }
});

export type CalVerFormat = z.infer<typeof CalVerFormat>;
