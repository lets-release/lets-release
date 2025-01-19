import { getArtifactMarkdown } from "src/helpers/getArtifactMarkdown";

describe("getArtifactMarkdown", () => {
  it("should return markdown link when url starts with http", () => {
    const result = getArtifactMarkdown({
      name: "example",
      url: "http://example.com",
    });
    expect(result).toBe("[example](http://example.com)");
  });

  it("should return name with code block when url does not start with http", () => {
    const result = getArtifactMarkdown({ name: "example", url: "example.com" });
    expect(result).toBe("example: `example.com`");
  });

  it("should return name with code block when url is not provided", () => {
    const result = getArtifactMarkdown({ name: "example" });
    expect(result).toBe("`example`");
  });
});
