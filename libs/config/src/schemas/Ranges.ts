import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { Range } from "src/schemas/Range";

/**
 * Version ranges record (package name as key).
 */
export const Ranges = z.record(NonEmptyString, Range.optional());

export type Ranges = z.infer<typeof Ranges>;
