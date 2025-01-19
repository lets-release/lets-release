import { Ranges } from "src/schemas/Ranges";

describe("Ranges", () => {
  it("should validate ranges", async () => {
    expect(Ranges.parse({ a: "1.0.x" })).toEqual({ a: "1.0.x" });
  });
});
