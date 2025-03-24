import { normalizeRegistry } from "src/helpers/toml/normalizeRegistry";

describe("normalizeRegistry", () => {
  it("should normalize registry data", () => {
    const registry = {
      name: "registryName",
      url: "${REGISTRY_URL}",
      "publish-url": "http://publish.url",
    };

    const result = normalizeRegistry(
      {
        env: {
          REGISTRY_URL: "http://registry.url",
        },
      },
      registry,
    );

    expect(result).toEqual({
      name: "registryName",
      url: "http://registry.url",
      publishUrl: "http://publish.url",
    });
  });

  it("should normalize registry data with missing url", () => {
    const registry = {
      name: "registryName",
      "publish-url": "http://publish.url",
    };

    const result = normalizeRegistry(
      {
        env: {
          REGISTRY_URL: "http://registry.url",
        },
      },
      registry,
    );

    expect(result).toEqual({
      name: "registryName",
      url: undefined,
      publishUrl: "http://publish.url",
    });
  });

  it("should return undefined for undefined", () => {
    const result = normalizeRegistry({ env: {} }, undefined);

    expect(result).toBeUndefined();
  });

  it("should return undefined for non-object value", () => {
    const result = normalizeRegistry({ env: {} }, [1]);

    expect(result).toBeUndefined();
  });

  it("should return undefined for missing publish-url", () => {
    const registry = {
      name: "registryName",
      url: "http://registry.url",
    };

    const result = normalizeRegistry({ env: {} }, registry);

    expect(result).toBeUndefined();
  });
});
