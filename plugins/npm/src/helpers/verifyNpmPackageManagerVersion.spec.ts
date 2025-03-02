import { $ } from "execa";
import findVersions from "find-versions";
import stripAnsi from "strip-ansi";

import { NoNpmPackageManagerBinaryError } from "src/errors/NoNpmPackageManagerBinaryError";
import { UnsupportedNpmPackageManagerVersionError } from "src/errors/UnsupportedNpmPackageManagerVersionError";
import { NpmPackageContext } from "src/types/NpmPackageContext";

import { verifyNpmPackageManagerVersion } from "./verifyNpmPackageManagerVersion";

vi.mock("execa");
vi.mock("strip-ansi");
vi.mock("find-versions");

const context = {
  env: process.env,
};
const pkg = {
  name: "pkg",
};

describe("verifyNpmPackageManagerVersion", () => {
  beforeEach(() => {
    vi.mocked($).mockReset();
    vi.mocked(stripAnsi)
      .mockReset()
      .mockImplementation((value) => value);
    vi.mocked(findVersions).mockReset();
  });

  it("should throw NoNpmPackageManagerBinaryError if pm binary not found", async () => {
    const error = new Error("execa error");
    vi.mocked($).mockReturnValue(vi.fn().mockRejectedValue(error) as never);

    await expect(
      verifyNpmPackageManagerVersion(context, {
        pm: { name: "npm" },
        pkg,
      } as unknown as NpmPackageContext),
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [expect.any(NoNpmPackageManagerBinaryError), error],
      }),
    );
  });

  it("should throw UnsupportedNpmPackageManagerVersionError if version is less than required", async () => {
    vi.mocked($).mockReturnValue(
      vi.fn().mockResolvedValue({
        stdout: "",
      }) as never,
    );

    vi.mocked(findVersions).mockReturnValueOnce(["7.0.0"]);
    await expect(
      verifyNpmPackageManagerVersion(context, {
        pm: { name: "pnpm" },
        pkg,
      } as unknown as NpmPackageContext),
    ).rejects.toThrow(UnsupportedNpmPackageManagerVersionError);

    vi.mocked(findVersions).mockReturnValueOnce(["3.0.0"]);
    await expect(
      verifyNpmPackageManagerVersion(context, {
        pm: { name: "yarn" },
        pkg,
      } as unknown as NpmPackageContext),
    ).rejects.toThrow(UnsupportedNpmPackageManagerVersionError);

    vi.mocked(findVersions).mockReturnValueOnce(["8.0.0"]);
    await expect(
      verifyNpmPackageManagerVersion(context, {
        pm: { name: "npm" },
        pkg,
      } as unknown as NpmPackageContext),
    ).rejects.toThrow(UnsupportedNpmPackageManagerVersionError);
  });

  it("should not throw any error if version is greater than or equal to required", async () => {
    vi.mocked($).mockReturnValue(
      vi.fn().mockResolvedValue({
        stdout: "",
      }) as never,
    );

    vi.mocked(findVersions).mockReturnValueOnce(["8.0.0"]);
    await expect(
      verifyNpmPackageManagerVersion(context, {
        pm: { name: "pnpm" },
        pkg,
      } as unknown as NpmPackageContext),
    ).resolves.toBeUndefined();

    vi.mocked(findVersions).mockReturnValueOnce(["4.0.0"]);
    await expect(
      verifyNpmPackageManagerVersion(context, {
        pm: { name: "yarn" },
        pkg,
      } as unknown as NpmPackageContext),
    ).resolves.toBeUndefined();

    vi.mocked(findVersions).mockReturnValueOnce(["8.5.0"]);
    await expect(
      verifyNpmPackageManagerVersion(context, {
        pm: { name: "npm" },
        pkg,
      } as unknown as NpmPackageContext),
    ).resolves.toBeUndefined();
  });
});
