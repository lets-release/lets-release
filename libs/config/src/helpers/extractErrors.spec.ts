import { extractErrors } from "src/helpers/extractErrors";

describe("extractErrors", () => {
  it("should extract errors", () => {
    expect(
      extractErrors(new AggregateError([new Error("test")], "test")),
    ).toEqual([new Error("test")]);

    expect(extractErrors(new Error("test"))).toEqual([new Error("test")]);
  });
});
