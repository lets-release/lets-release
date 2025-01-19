import { Step } from "src/enums/Step";
import { PluginObject } from "src/schemas/PluginObject";

describe("PluginObject", () => {
  it("should validate plugin object", () => {
    const obj = {
      [Step.generateNotes]: vi.fn(),
      [Step.publish]: vi.fn(),
      test: "test",
    };

    expect(PluginObject.parse(obj)).toEqual({
      [Step.generateNotes]: expect.any(Function),
      [Step.publish]: expect.any(Function),
      test: "test",
    });
  });
});
