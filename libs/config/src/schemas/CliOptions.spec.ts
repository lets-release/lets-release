import { CliOptions } from "src/schemas/CliOptions";

describe("CliOptions", () => {
  it("should validate cli options", () => {
    expect(CliOptions.parse({})).toEqual({});
  });
});
