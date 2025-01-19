import { PluginSpec } from "src/schemas/PluginSpec";

describe("PluginSpec", () => {
  it("should validate plugin spec", () => {
    expect(PluginSpec.parse("name")).toEqual("name");

    expect(PluginSpec.parse(["name", { test: "test" }])).toEqual([
      "name",
      { test: "test" },
    ]);
  });
});
