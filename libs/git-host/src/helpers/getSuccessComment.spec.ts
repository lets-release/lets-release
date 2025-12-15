import {
  ArtifactInfo,
  NextRelease,
  Package,
  PartialRequired,
} from "@lets-release/config";
import { getArtifactMarkdown } from "@lets-release/git-host";

import { getSuccessComment } from "src/helpers/getSuccessComment";

vi.mock("@lets-release/git-host");

const pkg = { name: "my-package" } as Package;
const nextRelease = { version: "1.0.0" } as NextRelease;

describe("getSuccessComment", () => {
  beforeEach(() => {
    vi.mocked(getArtifactMarkdown).mockReset();
  });

  it("should return a success comment for an issue without artifacts", () => {
    const artifacts: PartialRequired<ArtifactInfo, "name">[] = [];

    const result = getSuccessComment("issue", pkg, nextRelease, artifacts);

    expect(result)
      .toBe(`:tada: This issue has been resolved in my-package version 1.0.0 :tada:

Your **[lets-release][]** bot :package::rocket:

[lets-release]: https://github.com/lets-release/lets-release`);
  });

  it("should return a success comment for a pull request without artifacts", () => {
    const artifacts: PartialRequired<ArtifactInfo, "name">[] = [];

    const result = getSuccessComment("PR", pkg, nextRelease, artifacts);

    expect(result)
      .toBe(`:tada: This PR is included in my-package version 1.0.0 :tada:

Your **[lets-release][]** bot :package::rocket:

[lets-release]: https://github.com/lets-release/lets-release`);
  });

  it("should return a success comment for an issue with one artifacts", () => {
    vi.mocked(getArtifactMarkdown).mockReturnValue("Release 1 Markdown");

    const artifacts: PartialRequired<ArtifactInfo, "name">[] = [
      { name: "Release 1" },
    ];

    const result = getSuccessComment("issue", pkg, nextRelease, artifacts);

    expect(result)
      .toBe(`:tada: This issue has been resolved in my-package version 1.0.0 :tada:

The release is available on Release 1 Markdown

Your **[lets-release][]** bot :package::rocket:

[lets-release]: https://github.com/lets-release/lets-release`);
  });

  it("should return a success comment for a pull request with multiple artifacts", () => {
    vi.mocked(getArtifactMarkdown)
      .mockReturnValueOnce("Release 1 Markdown")
      .mockReturnValueOnce("Release 2 Markdown");

    const artifacts: PartialRequired<ArtifactInfo, "name">[] = [
      { name: "Release 1" },
      { name: "Release 2" },
    ];

    const result = getSuccessComment("PR", pkg, nextRelease, artifacts);

    expect(result)
      .toBe(`:tada: This PR is included in my-package version 1.0.0 :tada:

The release is available on:
- Release 1 Markdown
- Release 2 Markdown

Your **[lets-release][]** bot :package::rocket:

[lets-release]: https://github.com/lets-release/lets-release`);
  });
});
