import { parseIssues } from "src/helpers/parseIssues";

describe("parseIssues", () => {
  it("should return an empty array when messages are empty", () => {
    const result = parseIssues("github", "owner", "repo", []);

    expect(result).toEqual([]);
  });

  it("should return an empty array when messages contain only undefined", () => {
    const result = parseIssues("github", "owner", "repo", [undefined]);

    expect(result).toEqual([]);
  });

  it("should parse issues correctly from messages", () => {
    const messages = [
      "Fixes #1",
      "Closes owner/repo#2",
      "Resolves #3",
      "Fixes #4",
      "Closes #5",
    ];
    const result = parseIssues("github", "owner", "repo", messages);

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it("should filter out issues from different repositories", () => {
    const messages = ["Fixes #1", "Closes other/repo#2", "Resolves #3"];
    const result = parseIssues("github", "owner", "repo", messages);

    expect(result).toEqual([1, 3]);
  });

  it("should handle custom GitHub URL", () => {
    const messages = ["Fixes #1", "Closes owner/repo#2", "Resolves #3"];
    const result = parseIssues(
      "github",
      "owner",
      "repo",
      messages,
      "https://custom.github.com",
    );

    expect(result).toEqual([1, 2, 3]);
  });

  it("should return unique issues", () => {
    const messages = ["Fixes #1", "Fixes #1", "Closes #2", "Closes #2"];
    const result = parseIssues("github", "owner", "repo", messages);

    expect(result).toEqual([1, 2]);
  });
});
