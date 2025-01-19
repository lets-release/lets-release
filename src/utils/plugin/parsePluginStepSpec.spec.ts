import { parsePluginStepSpec } from "src/utils/plugin/parsePluginStepSpec";

describe("parsePluginStepSpec", () => {
  it("should parse plugin step spec", () => {
    expect(parsePluginStepSpec("plugin")).toEqual(["plugin", {}]);
    expect(parsePluginStepSpec(["plugin"])).toEqual(["plugin", {}]);
    expect(parsePluginStepSpec(["plugin", { test: "test" }])).toEqual([
      "plugin",
      { test: "test" },
    ]);
  });
});
