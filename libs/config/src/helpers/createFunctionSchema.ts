import { z } from "zod";

// https://github.com/colinhacks/zod/issues/4143#issuecomment-2845134912
export const createFunctionSchema = <T extends z.core.$ZodFunction>(
  schema: T,
) =>
  z.custom<Parameters<T["implement"]>[0]>((fn) =>
    schema.implement(
      fn as z.core.$InferInnerFunctionType<
        z.core.$ZodFunctionArgs,
        z.core.$ZodFunctionOut
      >,
    ),
  );
