import { Stats } from "node:fs";
import { stat } from "node:fs/promises";

import { FindPackagesContext } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { validatePackageInfos } from "src/utils/plugin/validators/validatePackageInfos";

vi.mock("node:fs/promises");

const repositoryRoot = "/root";

describe("validatePackageInfos", () => {
  beforeEach(() => {
    vi.mocked(stat)
      .mockReset()
      // eslint-disable-next-line @typescript-eslint/require-await
      .mockImplementation(async () => {
        return {
          isDirectory: () => true,
        } as Stats;
      });
  });

  it("should pass if no packages found", async () => {
    await expect(
      validatePackageInfos(
        { repositoryRoot } as FindPackagesContext,
        "test",
        undefined,
      ),
    ).resolves.toBeUndefined();
  });

  it("should pass if all packages are valid", async () => {
    await expect(
      validatePackageInfos({ repositoryRoot } as FindPackagesContext, "test", [
        {
          path: "/root/a",
          type: "npm",
          name: "a",
        },
      ]),
    ).resolves.toBeUndefined();
  });

  it("should throw error if path is not absolute", async () => {
    await expect(
      validatePackageInfos({ repositoryRoot } as FindPackagesContext, "test", [
        {
          path: "a",
          type: "npm",
          name: "a",
        },
      ]),
    ).rejects.toThrow(InvalidStepResultError);
  });

  it("should throw error if path not exists", async () => {
    vi.mocked(stat).mockRejectedValue(new Error("Unknown"));

    await expect(
      validatePackageInfos({ repositoryRoot } as FindPackagesContext, "test", [
        {
          path: "/root/a",
          type: "npm",
          name: "a",
        },
      ]),
    ).rejects.toThrow(InvalidStepResultError);
  });

  it("should throw error if path is not a directory", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    vi.mocked(stat).mockImplementation(async () => {
      return {
        isDirectory: () => false,
      } as Stats;
    });

    await expect(
      validatePackageInfos({ repositoryRoot } as FindPackagesContext, "test", [
        {
          path: "/root/a/package.json",
          type: "npm",
          name: "a",
        },
      ]),
    ).rejects.toThrow(InvalidStepResultError);
  });

  it("should throw error if path is not inside the repository", async () => {
    await expect(
      validatePackageInfos({ repositoryRoot } as FindPackagesContext, "test", [
        {
          path: "/test/a",
          type: "npm",
          name: "a",
        },
      ]),
    ).rejects.toThrow(InvalidStepResultError);
  });
});
