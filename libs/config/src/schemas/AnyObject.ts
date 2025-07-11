import { z } from "zod";

export const AnyObject = z.looseObject({});

export type AnyObject = z.infer<typeof AnyObject>;
