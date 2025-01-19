import { GitLabOptions } from "src/schemas/GitLabOptions";

describe("GitLabOptions schema", () => {
  it("should validate with minimal required fields", () => {
    const validData = {};
    expect(() => GitLabOptions.parse(validData)).not.toThrow();
  });

  it("should validate with all optional fields", () => {
    const validData = {
      gitlabToken: "token",
      url: "https://gitlab.com",
      proxy: "http://proxy.com",
      proxyOptions: {},
      assets: [
        {
          path: "dist/**",
          url: "https://example.com",
          label: "Example",
          type: "package",
          filepath: "path/to/file",
          target: "project_upload",
          status: "default",
        },
      ],
      milestones: ["v1.0"],
      releaseNameTemplate: "${nextRelease.tag}",
      releaseBodyTemplate: "${nextRelease.notes}",
      commentOnSuccess: true,
      successComment: "Release successful!",
      reportOnFailure: false,
      failureIssueTitle: "Release failed",
      failureIssueContent: "The release has failed.",
      failureIssueLabels: ["bug"],
      failureIssueAssignees: ["user1"],
    };
    expect(() => GitLabOptions.parse(validData)).not.toThrow();
  });

  it("should fail validation with invalid asset type", () => {
    const invalidData = {
      assets: [
        {
          path: "dist/**",
          type: "invalid-type",
        },
      ],
    };
    expect(() => GitLabOptions.parse(invalidData)).toThrow();
  });

  it("should fail validation with more than one failureIssueAssignees", () => {
    const invalidData = {
      failureIssueAssignees: ["user1", "user2"],
    };
    expect(() => GitLabOptions.parse(invalidData)).toThrow();
  });

  it("should validate with proxy set to false", () => {
    const validData = {
      proxy: false,
    };
    expect(() => GitLabOptions.parse(validData)).not.toThrow();
  });

  it("should validate with a function for commentOnSuccess", () => {
    const validData = {
      commentOnSuccess: () => true,
    };
    expect(() => GitLabOptions.parse(validData)).not.toThrow();
  });

  it("should validate with a function for reportOnFailure", () => {
    const validData = {
      reportOnFailure: () => false,
    };
    expect(() => GitLabOptions.parse(validData)).not.toThrow();
  });
});
