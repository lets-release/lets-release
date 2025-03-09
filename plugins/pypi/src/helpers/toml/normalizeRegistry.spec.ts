import { normalizeRegistry } from "src/helpers/toml/normalizeRegistry";

describe("normalizeRegistry", () => {
  it("should normalize registry data", () => {
    const registry = {
      name: "registryName",
      url: "http://registry.url",
      "publish-url": "http://publish.url",
    };

    const result = normalizeRegistry(registry);

    expect(result).toEqual({
      name: "registryName",
      url: "http://registry.url",
      publishUrl: "http://publish.url",
    });
  });

  it("should return undefined for undefined", () => {
    const result = normalizeRegistry(undefined);

    expect(result).toBeUndefined();
  });

  it("should return undefined for non-object value", () => {
    const result = normalizeRegistry([1]);

    expect(result).toBeUndefined();
  });

  it("should return undefined for missing publish-url", () => {
    const registry = {
      name: "registryName",
      url: "http://registry.url",
    };

    const result = normalizeRegistry(registry);

    expect(result).toBeUndefined();
  });
});
