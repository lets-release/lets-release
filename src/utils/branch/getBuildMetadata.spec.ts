import { getBuildMetadata } from "src/utils/branch/getBuildMetadata";

const hash = "123abc";
const pluginName = "plugin";

describe("getBuildMetadata", () => {
  it("should return hash if build is boolean", () => {
    expect(getBuildMetadata(true, hash)).toBe(hash);
  });

  it("should return compiled template if build is string", () => {
    expect(getBuildMetadata("build-${hash}", hash)).toBe(`build-${hash}`);
  });

  it("should return hash if build is an object and plugin-specific build is true", () => {
    expect(getBuildMetadata({ [pluginName]: true }, hash, pluginName)).toBe(
      hash,
    );
  });

  it("should return plugin-specific build metadata if build is an object and plugin-specific build is a string", () => {
    expect(
      getBuildMetadata({ [pluginName]: "build-${hash}" }, hash, pluginName),
    ).toBe(`build-${hash}`);
  });

  it("should return default build metadata if build is an object and plugin-specific build is not found and default build is provided", () => {
    expect(
      getBuildMetadata({ default: "build-${hash}" }, hash, pluginName),
    ).toBe(`build-${hash}`);
  });

  it("should return hash if build is an object and plugin-specific build is not found and default build is not found", () => {
    expect(getBuildMetadata({}, hash, pluginName)).toBe(hash);
  });

  it("should return default build metadata if build is an object without default build and plugin name is not provided", () => {
    expect(getBuildMetadata({}, hash)).toBe(hash);
  });

  it("should return default build metadata if build is an object with true as default build and plugin name is not provided", () => {
    expect(getBuildMetadata({ default: true }, hash)).toBe(hash);
  });

  it("should return default build metadata if build is an object with string as default build and plugin name is not provided", () => {
    expect(getBuildMetadata({ default: "build-${hash}" }, hash)).toBe(
      `build-${hash}`,
    );
  });
});
