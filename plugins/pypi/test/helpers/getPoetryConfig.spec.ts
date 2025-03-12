import { platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { getPoetryConfig } from "src/helpers/getPoetryConfig";

const binDir = inject("binDir");

describe("getPoetryConfig", () => {
  describe.each([
    MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.poetry],
    "latest",
  ])("poetry %s", (version) => {
    const POETRY_HOME = path.resolve(binDir, "poetry", version);
    const POETRY_BIN_DIR = path.resolve(POETRY_HOME, "bin");
    const PATH = `${POETRY_BIN_DIR}${platform() === "win32" ? ";" : ":"}${process.env.PATH}`;
    const env = {
      ...process.env,
      POETRY_HOME,
      PATH,
      Path: PATH,
    };

    it("should get poetry config", async () => {
      const cwd = temporaryDirectory();
      await $({
        cwd,
        env,
        reject: false,
      })`poetry init -n`;
      await $({
        cwd,
        env,
      })`poetry config repositories.test https://test.com --local`;

      await expect(
        getPoetryConfig("repositories.test.url", {
          cwd,
          env,
        }),
      ).resolves.toBe("https://test.com");
    });

    it("should return undefined if config is not found", async () => {
      const cwd = temporaryDirectory();
      await $({
        cwd,
        env,
        reject: false,
      })`poetry init -n`;

      await expect(
        getPoetryConfig("repositories.test.url", {
          cwd,
          env,
        }),
      ).resolves.toBeUndefined();
    });
  });
});
