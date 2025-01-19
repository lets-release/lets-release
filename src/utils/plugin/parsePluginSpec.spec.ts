import { parsePluginSpec } from "src/utils/plugin/parsePluginSpec";

describe("parsePluginSpec", () => {
  it("should parse plugin spec", () => {
    expect(parsePluginSpec("plugin")).toEqual(["plugin", {}]);
    expect(parsePluginSpec(["plugin"])).toEqual(["plugin", {}]);
    expect(parsePluginSpec(["plugin", { test: "test" }])).toEqual([
      "plugin",
      { test: "test" },
    ]);
  });
});
