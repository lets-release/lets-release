import { PluginStepSpec } from "src/schemas/PluginStepSpec";

describe("PluginStepSpec", () => {
  it("should validate plugin step spec", () => {
    expect(PluginStepSpec.parse("name")).toBe("name");

    expect(PluginStepSpec.parse(["name", { test: "test" }])).toEqual([
      "name",
      { test: "test" },
    ]);
  });
});
