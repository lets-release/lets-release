import { z } from "zod";

import { createFunctionSchema } from "src/helpers/createFunctionSchema";

const testFunction = (input: string) => Number.parseInt(input, 10);
const validFunction = (str: string, num: number) => str.length > num;
const asyncFunction = async (input: string) => {
  await Promise.resolve();
  return `processed: ${input}`;
};
const noArgsFunction = () => "hello world";
const optionalArgsFunction = (str: string, num?: number) =>
  num ? str.repeat(num) : str;
const objectFunction = (person: { name: string; age: number }) =>
  `${person.name} is ${person.age} years old`;
const unionFunction = (input: string) =>
  input.length > 5 ? input : input.length;

describe("createFunctionSchema", () => {
  it("should create a custom schema for a simple function", () => {
    const functionSchema = z.function({
      output: z.number(),
    });
    const customSchema = createFunctionSchema(functionSchema);

    expect(() => customSchema.parse(testFunction)).not.toThrow();
  });

  it("should validate function with correct signature", () => {
    const functionSchema = z.function({
      output: z.boolean(),
    });
    const customSchema = createFunctionSchema(functionSchema);

    expect(() => customSchema.parse(validFunction)).not.toThrow();
  });

  it("should work with function that returns a promise", () => {
    const asyncFunctionSchema = z.function({
      output: z.promise(z.string()),
    });
    const customSchema = createFunctionSchema(asyncFunctionSchema);

    expect(() => customSchema.parse(asyncFunction)).not.toThrow();
  });

  it("should work with function that has no arguments", () => {
    const noArgsFunctionSchema = z.function({
      output: z.string(),
    });
    const customSchema = createFunctionSchema(noArgsFunctionSchema);

    expect(() => customSchema.parse(noArgsFunction)).not.toThrow();
  });

  it("should work with function that has optional arguments", () => {
    const optionalArgsFunctionSchema = z.function({
      output: z.string(),
    });
    const customSchema = createFunctionSchema(optionalArgsFunctionSchema);

    expect(() => customSchema.parse(optionalArgsFunction)).not.toThrow();
  });

  it("should validate the function can be called correctly", () => {
    const functionSchema = z.function({
      output: z.number(),
    });
    const customSchema = createFunctionSchema(functionSchema);

    const validatedFunction = customSchema.parse(testFunction);

    expect(typeof validatedFunction).toBe("function");
    // The function should work when called with proper arguments
    expect((validatedFunction as (input: string) => number)("123")).toBe(123);
  });

  it("should work with complex object arguments", () => {
    const functionSchema = z.function({
      output: z.string(),
    });
    const customSchema = createFunctionSchema(functionSchema);

    expect(() => customSchema.parse(objectFunction)).not.toThrow();
  });

  it("should work with union output types", () => {
    const functionSchema = z.function({
      output: z.union([z.string(), z.number()]),
    });
    const customSchema = createFunctionSchema(functionSchema);

    expect(() => customSchema.parse(unionFunction)).not.toThrow();
  });

  it("should reject invalid values", () => {
    const functionSchema = z.function({
      output: z.string(),
    });
    const customSchema = createFunctionSchema(functionSchema);

    expect(() => customSchema.parse("not a function")).toThrow();
    expect(() => customSchema.parse(123)).toThrow();
    expect(() => customSchema.parse({})).toThrow();
    expect(() => customSchema.parse(null)).toThrow();
  });
});
