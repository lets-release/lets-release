import { normalizeUv } from "src/helpers/toml/normalizeUv";

describe("normalizeUv", () => {
  it("should normalize UV data", () => {
    const raw = {
      index: [
        { name: "registry1", "publish-url": "http://publish.url" },
        "registry2",
      ],
      "check-url": "http://check.url",
      "publish-url": "http://publish.url",
      "dev-dependencies": ["dep1", "dep2"],
    };

    const result = normalizeUv(raw);

    expect(result).toEqual({
      index: [
        { name: "registry1", url: undefined, publishUrl: "http://publish.url" },
      ],
      checkUrl: "http://check.url",
      publishUrl: "http://publish.url",
      devDependencies: ["dep1", "dep2"],
    });
  });
});
