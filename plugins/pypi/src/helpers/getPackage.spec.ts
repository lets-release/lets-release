import { NoPyPIPackageError } from "src/errors/NoPyPIPackageError";
import { getPackage } from "src/helpers/getPackage";
import { normalizePyProjectToml } from "src/helpers/normalizePyProjectToml";
import { readTomlFile } from "src/helpers/toml/readTomlFile";
import { NormalizedPyProjectToml } from "src/types/NormalizedPyProjectToml";

vi.mock("src/helpers/toml/readTomlFile");
vi.mock("src/helpers/normalizePyProjectToml");

const pkgRoot = "/path/to/package";
const pkg = {
  project: {
    name: "test-package",
    version: "1.0.0",
  },
} as NormalizedPyProjectToml;

vi.mocked(normalizePyProjectToml).mockReturnValue(pkg);

describe("getPackage", () => {
  beforeEach(() => {
    vi.mocked(readTomlFile).mockReset();
    vi.mocked(normalizePyProjectToml).mockClear();
  });

  it("should return normalized pyproject.toml content", async () => {
    const result = await getPackage({ env: {} }, pkgRoot);

    expect(result).toEqual(pkg);
  });

  it("should throw NoPyPIPackageError if pyproject.toml does not exist", async () => {
    vi.mocked(readTomlFile).mockRejectedValue({ code: "ENOENT" });

    await expect(getPackage({ env: {} }, pkgRoot)).rejects.toThrow(
      NoPyPIPackageError,
    );
  });

  it("should rethrow other errors", async () => {
    const error = new Error("Some other error");
    vi.mocked(readTomlFile).mockRejectedValue(error);

    await expect(getPackage({ env: {} }, pkgRoot)).rejects.toThrow(error);
  });
});
