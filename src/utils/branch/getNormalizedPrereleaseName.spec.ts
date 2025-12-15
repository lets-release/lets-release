import { NormalizedPrereleaseOptions } from "@lets-release/config";

import { getNormalizedPrereleaseName } from "src/utils/branch/getNormalizedPrereleaseName";

describe("getNormalizedPrereleaseName", () => {
  it("should return the plugin-specific name if it exists in options.name", () => {
    const options = {
      name: {
        default: "defaultName",
        pluginA: "pluginAName",
      },
    } as unknown as NormalizedPrereleaseOptions;
    const pluginName = "pluginA";

    const result = getNormalizedPrereleaseName(options, pluginName);
    expect(result).toBe("pluginAName");
  });

  it("should return the default name if plugin-specific name does not exist in options.name", () => {
    const options = {
      name: {
        default: "defaultName",
      },
    } as unknown as NormalizedPrereleaseOptions;
    const pluginName = "pluginB";

    const result = getNormalizedPrereleaseName(options, pluginName);
    expect(result).toBe("defaultName");
  });

  it("should return the default name if pluginName is not provided", () => {
    const options = {
      name: {
        default: "defaultName",
      },
    } as unknown as NormalizedPrereleaseOptions;

    const result = getNormalizedPrereleaseName(options);
    expect(result).toBe("defaultName");
  });
});
