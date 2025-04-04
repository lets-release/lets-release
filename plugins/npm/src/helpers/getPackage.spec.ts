import { readPackage } from "read-pkg";

import { NoNpmPackageError } from "src/errors/NoNpmPackageError";
import { NoNpmPackageNameError } from "src/errors/NoNpmPackageNameError";
import { getPackage } from "src/helpers/getPackage";

vi.mock("read-pkg");

const pkgRoot = "./";
const json = {
  name: "test",
};

describe("getPackage", () => {
  beforeEach(() => {
    vi.mocked(readPackage).mockReset();
  });

  it("should throw error if package.json not found", async () => {
    vi.mocked(readPackage).mockRejectedValue({ code: "ENOENT" });

    await expect(getPackage(pkgRoot)).rejects.toThrow(NoNpmPackageError);
  });

  it("should throw error if package name is not defined", async () => {
    vi.mocked(readPackage).mockResolvedValue({});

    await expect(getPackage(pkgRoot)).rejects.toThrow(NoNpmPackageNameError);
  });

  it("should return package.json", async () => {
    vi.mocked(readPackage).mockResolvedValue(json);

    await expect(getPackage(pkgRoot)).resolves.toBe(json);
  });
});
