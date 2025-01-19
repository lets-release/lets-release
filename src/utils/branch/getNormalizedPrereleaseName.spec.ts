import {
  NormalizedPrereleaseOptions,
  VersioningScheme,
} from "@lets-release/config";

import { getNormalizedPrereleaseName } from "src/utils/branch/getNormalizedPrereleaseName";

describe("getNormalizedPrereleaseName", () => {
  it("should return the plugin-specific name if it exists in options.name", () => {
    const options = {
      name: {
        default: "defaultName",
        pluginA: "pluginAName",
      },
    } as unknown as NormalizedPrereleaseOptions;
    const scheme: VersioningScheme = VersioningScheme.SemVer;
    const pluginName = "pluginA";

    const result = getNormalizedPrereleaseName(options, scheme, pluginName);
    expect(result).toBe("pluginAName");
  });

  it("should return the default name if plugin-specific name does not exist in options.name", () => {
    const options = {
      name: {
        default: "defaultName",
      },
    } as unknown as NormalizedPrereleaseOptions;
    const scheme: VersioningScheme = VersioningScheme.SemVer;
    const pluginName = "pluginB";

    const result = getNormalizedPrereleaseName(options, scheme, pluginName);
    expect(result).toBe("defaultName");
  });

  it("should return the plugin-specific name if it exists in options.names[scheme]", () => {
    const options = {
      names: {
        [VersioningScheme.SemVer]: {
          default: "defaultSemverName",
          pluginA: "pluginASemverName",
        },
      },
    } as unknown as NormalizedPrereleaseOptions;
    const scheme: VersioningScheme = VersioningScheme.SemVer;
    const pluginName = "pluginA";

    const result = getNormalizedPrereleaseName(options, scheme, pluginName);
    expect(result).toBe("pluginASemverName");
  });

  it("should return the default name if plugin-specific name does not exist in options.names[scheme]", () => {
    const options = {
      names: {
        [VersioningScheme.SemVer]: {
          default: "defaultSemverName",
        },
      },
    } as unknown as NormalizedPrereleaseOptions;
    const scheme: VersioningScheme = VersioningScheme.SemVer;
    const pluginName = "pluginB";

    const result = getNormalizedPrereleaseName(options, scheme, pluginName);
    expect(result).toBe("defaultSemverName");
  });

  it("should return the default name if pluginName is not provided", () => {
    const options = {
      name: {
        default: "defaultName",
      },
    } as unknown as NormalizedPrereleaseOptions;
    const scheme: VersioningScheme = VersioningScheme.SemVer;

    const result = getNormalizedPrereleaseName(options, scheme);
    expect(result).toBe("defaultName");
  });
});
