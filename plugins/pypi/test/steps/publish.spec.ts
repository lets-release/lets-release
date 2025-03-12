/* eslint-disable unicorn/consistent-function-scoping */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
import { stringify } from "smol-toml";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PublishContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { PYPI_ARTIFACT_NAME } from "src/constants/PYPI_ARTIFACT_NAME";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { normalizePyProjectToml } from "src/helpers/normalizePyProjectToml";
import { readTomlFile } from "src/helpers/toml/readTomlFile";
import { publish } from "src/steps/publish";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

const pypiPublishUrl = inject("pypiPublishUrl");
const pypiToken = inject("pypiToken");
const binDir = inject("binDir");
const UV_BIN_HOME = path.resolve(binDir, "uv", "latest");
const PATH = `${UV_BIN_HOME}${platform() === "win32" ? ";" : ":"}${process.env.PATH}`;
const env = {
  ...process.env,
  PATH,
  Path: PATH,
};
const stdout = new WritableStreamBuffer();
const stderr = new WritableStreamBuffer();
const log = vi.fn();
const warn = vi.fn();
const logger = { log, warn };
const context = {
  stdout,
  stderr,
  logger,
};

describe("publish", () => {
  it('should skip publish if "skipPublishing" is true', async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      project: {
        name: "skip_publish_pypi_publish",
        version: "0.0.0",
      },
      tool: {
        "lets-release": {
          registry: {
            "publish-url": pypiPublishUrl,
          },
          token: pypiToken,
        },
      },
    };
    await $({ cwd, env })`uv init --lib --name ${pkg.project.name}`;
    await $({ cwd, env })`uv sync`;

    const tomlFile = path.resolve(cwd, "pyproject.toml");
    const toml = await readTomlFile(tomlFile);

    await writeFile(
      tomlFile,
      stringify({
        ...toml,
        project: {
          ...(toml.project as object),
          ...pkg.project,
        },
        tool: {
          ...(toml.tool as object),
          ...pkg.tool,
        },
      }),
    );

    let pkgContext: PyPIPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: PyPIPackageContext) => {
      pkgContext = context;
    };

    const result = await publish(
      {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env,
        repositoryRoot: cwd,
        options: {},
        package: {
          ...pkg.project,
          path: cwd,
        },
        nextRelease: { channels: [null], version: "1.0.0" },
      } as unknown as PublishContext,
      { skipPublishing: true, distDir: "dist" },
    );

    expect(result).toBeUndefined();

    expect(
      normalizePyProjectToml(
        await readTomlFile(path.resolve(cwd, "pyproject.toml")),
      ),
    ).toEqual(
      expect.objectContaining({
        project: expect.objectContaining({
          version: "1.0.0",
        }),
      }),
    );

    const sdistFile = path.resolve(
      cwd,
      "dist",
      `${pkg.project.name}-1.0.0.tar.gz`,
    );
    expect(existsSync(sdistFile)).toBeTruthy();

    const wheelFile = path.resolve(
      cwd,
      "dist",
      `${pkg.project.name}-1.0.0-py3-none-any.whl`,
    );
    expect(existsSync(wheelFile)).toBeTruthy();
  });

  it("should skip publish if any private classifier is provided", async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      project: {
        name: "skip_publish_private",
        version: "0.0.0",
        classifiers: ["Private :: Do Not Publish"],
      },
      tool: {
        "lets-release": {
          registry: {
            "publish-url": pypiPublishUrl,
          },
          token: pypiToken,
        },
      },
    };
    await $({ cwd, env })`uv init --lib --name ${pkg.project.name}`;
    await $({ cwd, env })`uv sync`;

    const tomlFile = path.resolve(cwd, "pyproject.toml");
    const toml = await readTomlFile(tomlFile);

    await writeFile(
      tomlFile,
      stringify({
        ...toml,
        project: {
          ...(toml.project as object),
          ...pkg.project,
        },
        tool: {
          ...(toml.tool as object),
          ...pkg.tool,
        },
      }),
    );

    let pkgContext: PyPIPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: PyPIPackageContext) => {
      pkgContext = context;
    };

    const result = await publish(
      {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env,
        repositoryRoot: cwd,
        options: {},
        package: {
          ...pkg.project,
          path: cwd,
        },
        nextRelease: { channels: [null], version: "1.0.0" },
      } as unknown as PublishContext,
      { distDir: "dist" },
    );

    expect(result).toBeUndefined();

    expect(
      normalizePyProjectToml(
        await readTomlFile(path.resolve(cwd, "pyproject.toml")),
      ),
    ).toEqual(
      expect.objectContaining({
        project: expect.objectContaining({
          version: "1.0.0",
        }),
      }),
    );

    const sdistFile = path.resolve(
      cwd,
      "dist",
      `${pkg.project.name}-1.0.0.tar.gz`,
    );
    expect(existsSync(sdistFile)).toBeTruthy();

    const wheelFile = path.resolve(
      cwd,
      "dist",
      `${pkg.project.name}-1.0.0-py3-none-any.whl`,
    );
    expect(existsSync(wheelFile)).toBeTruthy();
  });

  it.each([MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.poetry], "latest"])(
    "should publish the package using poetry %s",
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
      const pkg = {
        project: {
          name: `publish_poetry_${version.replaceAll(".", "_")}`,
          version: "0.0.0-dev",
        },
        tool: {
          "lets-release": {
            registry: {
              "publish-url": pypiPublishUrl,
            },
            token: pypiToken,
          },
        },
      };
      await $({ cwd, env })`poetry init --name ${pkg.project.name} -n`;
      await mkdir(path.resolve(cwd, pkg.project.name), { recursive: true });
      await writeFile(path.resolve(cwd, pkg.project.name, "__init__.py"), "");
      await writeFile(path.resolve(cwd, "README.md"), "# test");
      await $({
        cwd,
        env,
      })`poetry config repositories.local ${pypiPublishUrl} --local`;
      await $({ cwd, env })`poetry install`;

      const tomlFile = path.resolve(cwd, "pyproject.toml");
      const toml = await readTomlFile(tomlFile);

      await writeFile(
        tomlFile,
        stringify({
          ...toml,
          project: {
            ...(toml.project as object),
            ...pkg.project,
          },
          tool: {
            ...(toml.tool as object),
            ...pkg.tool,
          },
        }),
      );

      let pkgContext: PyPIPackageContext;

      const getPluginPackageContext = () => pkgContext;
      const setPluginPackageContext = (context: PyPIPackageContext) => {
        pkgContext = context;
      };

      const result = await publish(
        {
          ...context,
          getPluginPackageContext,
          setPluginPackageContext,
          cwd,
          env,
          repositoryRoot: cwd,
          options: {},
          package: { ...pkg.project, path: cwd },
          nextRelease: {
            version: "1.0.0",
            channels: [null, "latest-1"],
          },
        } as unknown as PublishContext,
        {},
      );

      expect(result).toEqual({
        name: PYPI_ARTIFACT_NAME,
        url: undefined,
      });

      expect(normalizePyProjectToml(await readTomlFile(tomlFile))).toEqual(
        expect.objectContaining({
          project: expect.objectContaining({
            ...pkg.project,
            version: "1.0.0",
          }),
        }),
      );

      const sdistFile = path.resolve(
        cwd,
        "dist",
        `${pkg.project.name}-1.0.0.tar.gz`,
      );
      expect(existsSync(sdistFile)).toBeTruthy();

      const wheelFile = path.resolve(
        cwd,
        "dist",
        `${pkg.project.name}-1.0.0-py3-none-any.whl`,
      );
      expect(existsSync(wheelFile)).toBeTruthy();
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.uv], "latest"])(
    "should publish the package using uv %s",
    async (version) => {
      const UV_BIN_HOME = path.resolve(binDir, "uv", version);
      const PATH = `${UV_BIN_HOME}${platform() === "win32" ? ";" : ":"}${process.env.PATH}`;
      const env = {
        ...process.env,
        PATH,
        Path: PATH,
      };
      const cwd = temporaryDirectory();
      const packages = [
        {
          project: {
            name: `publish_uv_${version.replaceAll(".", "_")}`,
            version: "0.0.0-dev",
            path: cwd,
          },
          tool: {
            "lets-release": {
              registry: {
                "publish-url": pypiPublishUrl,
              },
              token: pypiToken,
            },
          },
        },
        {
          project: {
            name: `publish_uv_${version.replaceAll(".", "_")}_a`,
            version: "0.0.0-dev",
            path: path.resolve(cwd, "packages", "a"),
          },
          tool: {
            "lets-release": {
              registry: {
                "publish-url": pypiPublishUrl,
              },
              token: pypiToken,
            },
          },
        },
        {
          project: {
            name: `publish_uv_${version.replaceAll(".", "_")}_b`,
            version: "0.0.0-dev",
            path: path.resolve(cwd, "packages", "b"),
          },
          tool: {
            "lets-release": {
              registry: {
                "publish-url": pypiPublishUrl,
              },
              token: pypiToken,
            },
          },
        },
      ];

      await $({ cwd, env })`uv init --lib --name ${packages[0].project.name}`;
      await mkdir(packages[1].project.path, { recursive: true });
      await $({
        cwd: path.resolve(packages[1].project.path),
        env,
      })`uv init --lib --name ${packages[1].project.name}`;
      await mkdir(packages[2].project.path, { recursive: true });
      await $({
        cwd: path.resolve(packages[2].project.path),
        env,
      })`uv init --lib --name ${packages[2].project.name}`;
      await $({ cwd, env })`uv sync`;

      for (const pkg of packages) {
        const tomlFile = path.resolve(pkg.project.path, "pyproject.toml");
        const toml = await readTomlFile(tomlFile);

        await writeFile(
          tomlFile,
          stringify({
            ...toml,
            project: {
              ...(toml.project as object),
              ...pkg.project,
            },
            tool: {
              ...(toml.tool as object),
              ...pkg.tool,
            },
          }),
        );
      }

      for (const pkg of packages) {
        let pkgContext: PyPIPackageContext;

        const getPluginPackageContext = () => pkgContext;
        const setPluginPackageContext = (context: PyPIPackageContext) => {
          pkgContext = context;
        };

        const result = await publish(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env,
            repositoryRoot: cwd,
            options: {},
            package: pkg.project,
            nextRelease: {
              version: "1.0.0",
              channels: [null, "latest-1"],
            },
          } as unknown as PublishContext,
          {},
        );

        expect(result).toEqual({
          name: PYPI_ARTIFACT_NAME,
          url: undefined,
        });

        expect(
          normalizePyProjectToml(
            await readTomlFile(
              path.resolve(pkg.project.path, "pyproject.toml"),
            ),
          ),
        ).toEqual(
          expect.objectContaining({
            project: expect.objectContaining({
              version: "1.0.0",
            }),
          }),
        );

        const sdistFile = path.resolve(
          pkg.project.path,
          "dist",
          `${pkg.project.name}-1.0.0.tar.gz`,
        );
        expect(existsSync(sdistFile)).toBeTruthy();

        const wheelFile = path.resolve(
          pkg.project.path,
          "dist",
          `${pkg.project.name}-1.0.0-py3-none-any.whl`,
        );
        expect(existsSync(wheelFile)).toBeTruthy();
      }
    },
  );
});
