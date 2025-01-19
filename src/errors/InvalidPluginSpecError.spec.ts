import { InvalidPluginSpecError } from "src/errors/InvalidPluginSpecError";

describe("InvalidPluginSpecError", () => {
  it("should be defined", () => {
    const error = new InvalidPluginSpecError(
      {
        name: "plugin",
      },
      new Error("Invalid plugin"),
    );

    expect(error.message).toBe(
      "A plugin is invalid in the `plugins` configuration.",
    );
    expect(error.details).toEqual(
      expect.stringContaining(
        "Each plugin in the plugins configuration must be an npm module name",
      ),
    );
  });
});
