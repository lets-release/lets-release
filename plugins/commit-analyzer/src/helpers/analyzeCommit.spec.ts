import { Package, ReleaseType } from "@lets-release/config";
import { ParsedCommit } from "@lets-release/conventional-changelog";

import { analyzeCommit } from "src/helpers/analyzeCommit";
import { ReleaseRule } from "src/schemas/ReleaseRule";

const pkg = { uniqueName: "lets-release" } as Package;

describe("analyzeCommit", () => {
  it("should match breaking change", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          notes: [
            {
              title: "BREAKING CHANGE",
              text: "some breaking change",
            },
          ],
        } as Omit<ParsedCommit, "rawMsg">,
        [
          {
            breaking: true,
            release: ReleaseType.major,
          },
        ],
      ),
    ).toBe(ReleaseType.major);
  });

  it("should match revert commit", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          revert: {
            header: "Update: First feature",
            hash: "123",
          },
        } as unknown as Omit<ParsedCommit, "rawMsg">,
        [
          {
            revert: true,
            release: ReleaseType.patch,
          },
        ],
      ),
    ).toBe(ReleaseType.patch);
  });

  it("should match multiple criteria with breaking change", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          type: "feat",
          notes: [
            {
              title: "BREAKING CHANGE",
              text: "some breaking change",
            },
          ],
        } as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "feat",
            breaking: true,
            release: ReleaseType.major,
          },
        ],
      ),
    ).toBe(ReleaseType.major);
  });

  it("should match multiple criteria with revert", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          type: "feat",
          revert: {
            header: "Update: First feature",
            hash: "123",
          },
        } as unknown as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "feat",
            revert: true,
            release: ReleaseType.major,
          },
        ],
      ),
    ).toBe(ReleaseType.major);
  });

  it("should match multiple criteria", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          type: "feat",
          scope: 1,
        } as unknown as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "feat",
            scope: 1,
            release: ReleaseType.major,
          },
        ],
      ),
    ).toBe(ReleaseType.major);
  });

  it("should match only if all criteria are verified", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          type: "fix",
          notes: [
            {
              title: "BREAKING CHANGE",
              text: "some breaking change",
            },
          ],
        } as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "fix",
            release: ReleaseType.minor,
          },
          {
            type: "fix",
            breaking: true,
            release: ReleaseType.major,
          },
        ],
      ),
    ).toBe(ReleaseType.major);
  });

  it("should return undefined if there is no match", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          type: "fix",
          notes: [
            {
              title: "BREAKING CHANGE",
              text: "some breaking change",
            },
          ],
        } as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "feat",
            breaking: true,
            release: ReleaseType.major,
          },
        ],
      ),
    ).toBe(undefined);
  });

  it("should return undefined for commit with falsy properties", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          type: null,
        } as unknown as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "feat",
          },
        ] as unknown as ReleaseRule[],
      ),
    ).toBe(undefined);
  });

  it("should match with glob", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          type: "docs",
          scope: "bar",
        } as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "docs",
            scope: "b*",
            release: ReleaseType.minor,
          },
        ],
      ),
    ).toBe(ReleaseType.minor);

    expect(
      analyzeCommit(
        pkg,
        {
          type: "docs",
          scope: "baz",
        } as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "docs",
            scope: "b*",
            release: ReleaseType.minor,
          },
        ],
      ),
    ).toBe(ReleaseType.minor);

    expect(
      analyzeCommit(
        pkg,
        {
          type: "docs",
          scope: "foo",
        } as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "docs",
            scope: "b*",
            release: ReleaseType.minor,
          },
        ],
      ),
    ).toBe(undefined);
  });

  it("should return highest release type if multiple rules match", () => {
    expect(
      analyzeCommit(
        pkg,
        {
          type: "feat",
          notes: [
            {
              title: "BREAKING CHANGE",
              text: "some breaking change",
            },
          ],
        } as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "feat",
            release: ReleaseType.minor,
          },
          {
            breaking: true,
            release: ReleaseType.minor,
          },
          {
            type: "feat",
            breaking: true,
            release: ReleaseType.major,
          },
        ],
      ),
    ).toBe(ReleaseType.major);
  });

  it('should return "null" for release type if the matching rule has "release" set to "null"', () => {
    expect(
      analyzeCommit(
        pkg,
        {
          type: "fix",
        } as Omit<ParsedCommit, "rawMsg">,
        [
          {
            type: "fix",
            release: null,
          },
        ],
      ),
    ).toBe(null);
  });
});
