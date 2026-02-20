import { $ } from "execa";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { NoPyPIPackageManagerBinaryError } from "src/errors/NoPyPIPackageManagerBinaryError";
import { UnsupportedPyPIPackageManagerVersionError } from "src/errors/UnsupportedPyPIPackageManagerVersionError";
import { verifyPyPIPackageManagerVersion } from "src/helpers/verifyPyPIPackageManagerVersion";
import { NormalizedPyProjectToml } from "src/types/NormalizedPyProjectToml";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

const context = { env: {} } as AnalyzeCommitsContext;
const pkg = { project: { name: "test-package" } } as NormalizedPyProjectToml;

describe("verifyPyPIPackageManagerVersion", () => {
  beforeEach(() => {
    exec.mockReset();
  });

  it("should throw NoPyPIPackageManagerBinaryError if binary is not found", async () => {
    exec.mockRejectedValueOnce(new Error("Command not found"));

    await expect(
      verifyPyPIPackageManagerVersion(context, {
        pm: { name: "poetry", version: "1", root: "/path/to/repo" },
        pkg,
      } as PyPIPackageContext),
    ).rejects.toThrow(NoPyPIPackageManagerBinaryError);
  });

  it("should throw UnsupportedPyPIPackageManagerVersionError if version is less than required", async () => {
    exec.mockResolvedValueOnce({ stdout: "poetry version 0.9.0" });

    await expect(
      verifyPyPIPackageManagerVersion(context, {
        pm: { name: "poetry", version: "1", root: "/path/to/repo" },
        pkg,
      } as PyPIPackageContext),
    ).rejects.toThrow(UnsupportedPyPIPackageManagerVersionError);

    exec.mockResolvedValueOnce({ stdout: "uv version 0.0.9" });

    await expect(
      verifyPyPIPackageManagerVersion(context, {
        pm: { name: "uv", version: "1", root: "/path/to/repo" },
        pkg,
      } as PyPIPackageContext),
    ).rejects.toThrow(UnsupportedPyPIPackageManagerVersionError);
  });

  it("should return version if version is greater than or equal to required", async () => {
    exec.mockResolvedValueOnce({ stdout: "poetry version 2.0.0" });

    await expect(
      verifyPyPIPackageManagerVersion(context, {
        pm: { name: "poetry", version: "1", root: "/path/to/repo" },
        pkg,
      } as PyPIPackageContext),
    ).resolves.toBe("2.0.0");

    exec.mockResolvedValueOnce({ stdout: "uv version 0.5.0" });

    await expect(
      verifyPyPIPackageManagerVersion(context, {
        pm: { name: "uv", version: "1", root: "/path/to/repo" },
        pkg,
      } as PyPIPackageContext),
    ).resolves.toBe("0.5.0");
  });
});
