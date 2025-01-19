import { z } from "zod";

export const AnyObject = z.object({}).passthrough();

export type AnyObject = z.infer<typeof AnyObject>;
