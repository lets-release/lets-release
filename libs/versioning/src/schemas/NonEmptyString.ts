import { z } from "zod";

/**
 * A non-empty string.
 */
export const NonEmptyString = z.string().trim().min(1);

export type NonEmptyString = z.infer<typeof NonEmptyString>;
