import path from "node:path";

import { $ } from "execa";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { getPoetryRegistries } from "src/helpers/getPoetryRegistries";

const binDir = inject("binDir");

describe("getPoetryRegistries", () => {
  it.each([MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.poetry], "latest"])(
    "poetry %s",
    (version) => {
      const POETRY_HOME = path.resolve(binDir, "poetry", version);
      const POETRY_BIN_DIR = path.resolve(POETRY_HOME, "bin");
      const env = {
        ...process.env,
        POETRY_HOME,
        PATH: `${POETRY_BIN_DIR}:${process.env.PATH}`,
        Path: `${POETRY_BIN_DIR};${process.env.Path}`,
      };

      it("should get poetry registries", async () => {
        const cwd = temporaryDirectory();
        await $({
          cwd,
          env,
          reject: false,
        })`poetry init -n`;
        await $({
          cwd,
          env,
        })`poetry config repositories.a https://test.com --local`;
        await $({
          cwd,
          env,
        })`poetry config repositories.b https://test.com --local`;
        await $({
          cwd,
          env,
        })`poetry config repositories.c.d https://test.com --local`;

        await expect(getPoetryRegistries({ cwd, env })).resolves.toEqual([
          {
            name: "a",
            publishUrl: "https://test.com",
          },
          {
            name: "b",
            publishUrl: "https://test.com",
          },
          {
            name: "c.d",
            publishUrl: "https://test.com",
          },
        ]);
      });
    },
  );
});
