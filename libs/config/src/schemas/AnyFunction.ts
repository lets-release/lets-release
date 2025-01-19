import { z } from "zod";

export const AnyFunction = z.custom<AnyFunction>((val) => {
  return typeof val === "function";
});

export type AnyFunction = (...args: unknown[]) => unknown | Promise<unknown>;
