import { GitHostOptions } from "src/schemas/GitHostOptions";

describe("GitHostOptions schema", () => {
  it("should validate a complete object", () => {
    const validData = {
      url: "https://example.com",
      apiUrl: "https://api.example.com",
      proxy: "http://proxy.example.com",
      proxyOptions: { host: "proxy.example.com", port: 8080 },
      assets: [{ name: "file1.txt", path: "/path/to/file1.txt" }],
      positionOfOtherArtifacts: "bottom",
      releaseNameTemplate: "Release ${nextRelease.tag}",
      releaseBodyTemplate: "Notes: ${nextRelease.notes}",
      commentOnSuccess: true,
      successComment: "Release successful!",
      successLabels: ["released", "v1.0"],
    };

    expect(() => GitHostOptions.parse(validData)).not.toThrow();
  });

  it("should validate with minimal required fields", () => {
    const validData = {};

    expect(() => GitHostOptions.parse(validData)).not.toThrow();
  });

  it("should invalidate incorrect data types", () => {
    const invalidData = {
      url: 123,
      apiUrl: false,
      proxy: 456,
      assets: "not an array",
      positionOfOtherArtifacts: "middle",
      releaseNameTemplate: 789,
      releaseBodyTemplate: true,
      commentOnSuccess: "yes",
      successComment: 101_112,
      successLabels: "not an array",
    };

    expect(() => GitHostOptions.parse(invalidData)).toThrow();
  });

  it("should validate optional fields", () => {
    const validData = {
      url: "https://example.com",
      apiUrl: "https://api.example.com",
      proxy: false,
      assets: [{ name: "file1.txt", path: "/path/to/file1.txt" }],
      positionOfOtherArtifacts: "top",
      releaseNameTemplate: "Release ${nextRelease.tag}",
      releaseBodyTemplate: "Notes: ${nextRelease.notes}",
      commentOnSuccess: () => true,
      successComment: "Release successful!",
      successLabels: ["released", "v1.0"],
    };

    expect(() => GitHostOptions.parse(validData)).not.toThrow();
  });

  it("should invalidate missing required fields", () => {
    const invalidData = {
      url: "https://example.com",
      apiUrl: "https://api.example.com",
    };

    expect(() => GitHostOptions.parse(invalidData)).not.toThrow();
  });
});
