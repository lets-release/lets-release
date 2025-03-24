import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PrepareContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { normalizePyProjectToml } from "src/helpers/normalizePyProjectToml";
import { preparePackage } from "src/helpers/preparePackage";
import { readTomlFile } from "src/helpers/toml/readTomlFile";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

const binDir = inject("binDir");
const stdout = new WritableStreamBuffer();
const stderr = new WritableStreamBuffer();
const log = vi.fn();
const logger = { log };
const setPluginPackageContext = vi.fn();
const distDir = "build";

describe("preparePackage", () => {
  it.each([MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.poetry], "latest"])(
    "should prepare package using poetry %s",
    async (version) => {
      const POETRY_HOME = path.resolve(binDir, "poetry", version);
      const POETRY_BIN_DIR = path.resolve(POETRY_HOME, "bin");
      const PATH = `${POETRY_BIN_DIR}${platform() === "win32" ? ";" : ":"}${process.env.PATH}`;
      const env = {
        ...process.env,
        POETRY_HOME,
        PATH,
        Path: PATH,
      };
      const cwd = temporaryDirectory();
      const pkgContext = {
        pm: {
          name: PyPIPackageManagerName.poetry,
          root: cwd,
        },
        pkg: {},
        registry: {},
      } as PyPIPackageContext;
      await $({
        cwd,
        env,
        reject: false,
      })`poetry init --name test -n`;
      await mkdir(path.resolve(cwd, "test"), { recursive: true });
      await writeFile(path.resolve(cwd, "test", "__init__.py"), "");
      await writeFile(path.resolve(cwd, "README.md"), "# test");
      await $({
        cwd,
        env,
      })`poetry install`;

      await preparePackage(
        {
          env,
          stdout,
          stderr,
          logger,
          repositoryRoot: cwd,
          package: { path: cwd, uniqueName: "test" },
          nextRelease: { version: "3.0.0" },
          setPluginPackageContext,
        } as unknown as PrepareContext,
        pkgContext,
        { distDir },
      );

      const pyProjectToml = normalizePyProjectToml(
        { env },
        await readTomlFile(path.resolve(cwd, "pyproject.toml")),
      );
      expect(pyProjectToml.project.version).toBe("3.0.0");

      const sdistFile = path.resolve(cwd, distDir, "test-3.0.0.tar.gz");
      expect(existsSync(sdistFile)).toBeTruthy();

      const wheelFile = path.resolve(
        cwd,
        distDir,
        "test-3.0.0-py3-none-any.whl",
      );
      expect(existsSync(wheelFile)).toBeTruthy();
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.uv], "latest"])(
    "should prepare package using uv %s",
    async (version) => {
      const UV_BIN_HOME = path.resolve(binDir, "uv", version);
      const PATH = `${UV_BIN_HOME}${platform() === "win32" ? ";" : ":"}${process.env.PATH}`;
      const env = {
        ...process.env,
        PATH,
        Path: PATH,
      };
      const cwd = temporaryDirectory();
      const pkgContext = {
        pm: {
          name: PyPIPackageManagerName.uv,
          root: cwd,
        },
        pkg: {},
        registry: {},
      } as PyPIPackageContext;
      await $({
        cwd,
        env,
      })`uv init --lib --name test`;
      await $({
        cwd,
        env,
      })`uv sync`;

      await preparePackage(
        {
          env,
          stdout,
          stderr,
          logger,
          repositoryRoot: cwd,
          package: { path: cwd, uniqueName: "test" },
          nextRelease: { version: "3.0.0" },
          setPluginPackageContext,
        } as unknown as PrepareContext,
        pkgContext,
        { distDir },
      );

      const pyProjectToml = normalizePyProjectToml(
        { env },
        await readTomlFile(path.resolve(cwd, "pyproject.toml")),
      );
      expect(pyProjectToml.project.version).toBe("3.0.0");

      const sdistFile = path.resolve(cwd, distDir, "test-3.0.0.tar.gz");
      expect(existsSync(sdistFile)).toBeTruthy();

      const wheelFile = path.resolve(
        cwd,
        distDir,
        "test-3.0.0-py3-none-any.whl",
      );
      expect(existsSync(wheelFile)).toBeTruthy();
    },
  );
});
