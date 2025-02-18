import { sync } from "dir-glob";
import micromatch from "micromatch";

import { getMatchFiles } from "src/utils/getMatchFiles";

vi.mock("dir-glob");
vi.mock("micromatch");

const repositoryRoot = "/repo/root";
const files = ["src/index.js", "README.md"];

vi.mocked(sync).mockReset().mockReturnValue([]);
vi.mocked(micromatch).mockReset().mockReturnValue(files);

describe("getMatchFiles", () => {
  it("should return matched files for a given glob pattern", () => {
    expect(getMatchFiles({ repositoryRoot }, files, "*.js")).toBe(files);
  });

  it("should return matched files for an array of glob patterns", () => {
    expect(getMatchFiles({ repositoryRoot }, files, ["*.js", "*.ts"])).toBe(
      files,
    );
  });

  it("should handle negated glob patterns", () => {
    expect(getMatchFiles({ repositoryRoot }, files, "!*.md")).toBe(files);
  });
});
