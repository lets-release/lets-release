import { z } from "zod";

/**
 * Result of generateNotes step.
 */
export const GenerateNotesResult = z.string().optional();

export type GenerateNotesResult = z.infer<typeof GenerateNotesResult>;
