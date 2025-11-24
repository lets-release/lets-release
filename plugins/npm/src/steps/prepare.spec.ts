import { PrepareContext } from "@lets-release/config";

import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { preparePackage } from "src/helpers/preparePackage";
import { prepare } from "src/steps/prepare";

vi.mock("src/helpers/ensureNpmPackageContext");
vi.mock("src/helpers/preparePackage");

describe("prepare", () => {
  it("should skip if package type is not npm", async () => {
    await expect(
      prepare(
        {
          package: {
            path: "/root/a",
            type: "python",
            name: "pkg",
            uniqueName: "python/pkg",
          },
        } as PrepareContext,
        {},
      ),
    ).resolves.toBe(undefined);
    expect(vi.mocked(ensureNpmPackageContext)).not.toHaveBeenCalled();
    expect(vi.mocked(preparePackage)).not.toHaveBeenCalled();
  });

  it("should prepare", async () => {
    await expect(
      prepare(
        {
          package: {
            path: "/root/a",
            type: "npm",
            name: "pkg",
            uniqueName: "npm/pkg",
          },
        } as PrepareContext,
        {},
      ),
    ).resolves.toBe(undefined);
    expect(vi.mocked(ensureNpmPackageContext)).toHaveBeenCalledOnce();
    expect(vi.mocked(preparePackage)).toHaveBeenCalledOnce();
  });
});
