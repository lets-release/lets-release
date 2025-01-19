import { GitHubOptions } from "src/schemas/GitHubOptions";

describe("GitHubOptions", () => {
  it("should validate with minimal required fields", () => {
    const result = GitHubOptions.safeParse({});

    expect(result.success).toBe(true);
  });

  it("should validate with all optional fields", () => {
    const result = GitHubOptions.safeParse({
      url: "https://github.com",
      apiUrl: "https://api.github.com",
      proxy: "http://proxy.com",
      proxyOptions: { auth: "user:pass" },
      draftRelease: true,
      assets: ["dist/**/*.js"],
      positionOfOtherArtifacts: "top",
      releaseNameTemplate: "<%= nextRelease.name %>",
      releaseBodyTemplate: "<%= nextRelease.notes %>",
      discussionCategoryName: "General",
      commentOnSuccess: false,
      successComment: "Release successful!",
      successLabels: ["released"],
    });

    expect(result.success).toBe(true);
  });

  it("should fail validation with invalid positionOfOtherArtifacts value", () => {
    const result = GitHubOptions.safeParse({
      positionOfOtherArtifacts: "middle",
    });

    expect(result.success).toBe(false);
  });

  it("should fail validation with empty releaseNameTemplate", () => {
    const result = GitHubOptions.safeParse({
      releaseNameTemplate: "",
    });

    expect(result.success).toBe(false);
  });

  it("should fail validation with empty releaseBodyTemplate", () => {
    const result = GitHubOptions.safeParse({
      releaseBodyTemplate: "",
    });

    expect(result.success).toBe(false);
  });

  it("should fail validation with empty successComment", () => {
    const result = GitHubOptions.safeParse({
      successComment: "",
    });

    expect(result.success).toBe(false);
  });
});
