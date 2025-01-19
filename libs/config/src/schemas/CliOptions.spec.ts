import { CliOptions } from "src/schemas/CliOptions";

describe("CliOptions", () => {
  it("should validate cli options", async () => {
    expect(CliOptions.parse({})).toEqual({});
  });
});
