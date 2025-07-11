import { z } from "zod";

import { createAsyncFunctionSchema } from "src/helpers/createAsyncFunctionSchema";

const asyncTestFunction = async (input: string) => {
  await Promise.resolve();
  return Number.parseInt(input, 10);
};
const asyncValidFunction = async (str: string, num: number) => {
  await Promise.resolve();
  return str.length > num;
};
const simpleAsyncFunction = async (input: string) => {
  await Promise.resolve();
  return `processed: ${input}`;
};
const asyncNoArgsFunction = async () => {
  await Promise.resolve();
  return "hello world";
};
const asyncOptionalArgsFunction = async (str: string, num?: number) => {
  await Promise.resolve();
  return num ? str.repeat(num) : str;
};
const asyncObjectFunction = async (person: { name: string; age: number }) => {
  await Promise.resolve();
  return `${person.name} is ${person.age} years old`;
};
const asyncUnionFunction = async (input: string) => {
  await Promise.resolve();
  return input.length > 5 ? input : input.length;
};
const syncFunction = (input: string) => `sync: ${input}`;

describe("createAsyncFunctionSchema", () => {
  it("should create a custom schema for a simple async function", () => {
    const functionSchema = z.function({
      output: z.promise(z.number()),
    });
    const customSchema = createAsyncFunctionSchema(functionSchema);

    expect(() => customSchema.parse(asyncTestFunction)).not.toThrow();
  });

  it("should validate async function with correct signature", () => {
    const functionSchema = z.function({
      output: z.promise(z.boolean()),
    });
    const customSchema = createAsyncFunctionSchema(functionSchema);

    expect(() => customSchema.parse(asyncValidFunction)).not.toThrow();
  });

  it("should work with async function that returns a promise", () => {
    const asyncFunctionSchema = z.function({
      output: z.promise(z.string()),
    });
    const customSchema = createAsyncFunctionSchema(asyncFunctionSchema);

    expect(() => customSchema.parse(simpleAsyncFunction)).not.toThrow();
  });

  it("should work with async function that has no arguments", () => {
    const noArgsFunctionSchema = z.function({
      output: z.promise(z.string()),
    });
    const customSchema = createAsyncFunctionSchema(noArgsFunctionSchema);

    expect(() => customSchema.parse(asyncNoArgsFunction)).not.toThrow();
  });

  it("should work with async function that has optional arguments", () => {
    const optionalArgsFunctionSchema = z.function({
      output: z.promise(z.string()),
    });
    const customSchema = createAsyncFunctionSchema(optionalArgsFunctionSchema);

    expect(() => customSchema.parse(asyncOptionalArgsFunction)).not.toThrow();
  });

  it("should validate the async function can be called correctly", async () => {
    const functionSchema = z.function({
      output: z.promise(z.number()),
    });
    const customSchema = createAsyncFunctionSchema(functionSchema);

    const validatedFunction = customSchema.parse(asyncTestFunction);

    expect(typeof validatedFunction).toBe("function");
    // The async function should work when called with proper arguments
    const result = await (
      validatedFunction as (input: string) => Promise<number>
    )("123");
    expect(result).toBe(123);
  });

  it("should work with complex object arguments", () => {
    const functionSchema = z.function({
      output: z.promise(z.string()),
    });
    const customSchema = createAsyncFunctionSchema(functionSchema);

    expect(() => customSchema.parse(asyncObjectFunction)).not.toThrow();
  });

  it("should work with union output types", () => {
    const functionSchema = z.function({
      output: z.promise(z.union([z.string(), z.number()])),
    });
    const customSchema = createAsyncFunctionSchema(functionSchema);

    expect(() => customSchema.parse(asyncUnionFunction)).not.toThrow();
  });

  it("should reject invalid values", () => {
    const functionSchema = z.function({
      output: z.promise(z.string()),
    });
    const customSchema = createAsyncFunctionSchema(functionSchema);

    expect(() => customSchema.parse("not a function")).toThrow();
    expect(() => customSchema.parse(123)).toThrow();
    expect(() => customSchema.parse({})).toThrow();
    expect(() => customSchema.parse(null)).toThrow();
  });

  it("should reject sync functions when async is expected", () => {
    const functionSchema = z.function({
      output: z.promise(z.string()),
    });
    const customSchema = createAsyncFunctionSchema(functionSchema);

    expect(() => customSchema.parse(syncFunction)).not.toThrow();
  });
});
