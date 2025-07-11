import { z } from "zod";

// https://github.com/colinhacks/zod/issues/4143#issuecomment-2845134912
export const createAsyncFunctionSchema = <T extends z.core.$ZodFunction>(
  schema: T,
) =>
  z.custom<Parameters<T["implementAsync"]>[0]>((fn) =>
    schema.implementAsync(
      fn as z.core.$InferInnerFunctionTypeAsync<
        z.core.$ZodFunctionArgs,
        z.core.$ZodFunctionOut
      >,
    ),
  );
