import { mkdir, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
import { stringify } from "smol-toml";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { VerifyConditionsContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { NeedAuthError } from "src/errors/NeedAuthError";
import { readTomlFile } from "src/helpers/toml/readTomlFile";
import { verifyConditions } from "src/steps/verifyConditions";
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
const logger = { log };
const context = {
  stdout,
  stderr,
  logger,
};

describe("verifyConditions", () => {
  it('should skip pypi auth verification if "skipPublishing" is true', async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      project: {
        name: "skip-verify-conditions-pypi-publish",
        version: "1.0.0",
      },
      tool: {
        "lets-release": {
          registry: {
            "publish-url": pypiPublishUrl,
          },
        },
      },
    };
    await writeFile(path.resolve(cwd, "pyproject.toml"), stringify(pkg));

    await expect(
      verifyConditions(
        {
          ...context,
          cwd,
          env,
          repositoryRoot: cwd,
          packages: [
            {
              ...pkg.project,
              path: cwd,
            },
          ],
        } as unknown as VerifyConditionsContext,
        { skipPublishing: true },
      ),
    ).resolves.toBeUndefined();
  });

  it("should skip pypi auth verification if any private classifier is provided", async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      project: {
        name: "skip-verify-conditions-private",
        version: "1.0.0",
        classifiers: ["Private :: Do Not Publish"],
      },
      tool: {
        "lets-release": {
          registry: {
            "publish-url": pypiPublishUrl,
          },
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
    const setPluginPackageContext = (
      type: string,
      name: string,
      context: PyPIPackageContext,
    ) => {
      pkgContext = context;
    };

    await expect(
      verifyConditions(
        {
          ...context,
          getPluginPackageContext,
          setPluginPackageContext,
          cwd,
          env,
          repositoryRoot: cwd,
          packages: [
            {
              ...pkg.project,
              path: cwd,
            },
          ],
        } as unknown as VerifyConditionsContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should throws error if failed", async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      project: {
        name: "verify-conditions",
        version: "1.0.0",
      },
      tool: {
        "lets-release": {
          registry: {
            "publish-url": pypiPublishUrl,
          },
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
    const setPluginPackageContext = (
      type: string,
      name: string,
      context: PyPIPackageContext,
    ) => {
      pkgContext = context;
    };

    await expect(
      verifyConditions(
        {
          ...context,
          getPluginPackageContext,
          setPluginPackageContext,
          cwd,
          env,
          repositoryRoot: cwd,
          packages: [
            {
              ...pkg.project,
              path: cwd,
            },
          ],
        } as unknown as VerifyConditionsContext,
        {},
      ),
    ).rejects.toThrow(NeedAuthError);
  });

  it.each([MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.poetry], "latest"])(
    "should verify auth using poetry %s",
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
          name: `verify_conditions_poetry_${version.replaceAll(".", "_")}`,
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
      const setPluginPackageContext = (
        type: string,
        name: string,
        context: PyPIPackageContext,
      ) => {
        pkgContext = context;
      };

      await expect(
        verifyConditions(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env,
            repositoryRoot: cwd,
            packages: [
              {
                ...pkg.project,
                path: cwd,
              },
            ],
          } as unknown as VerifyConditionsContext,
          {},
        ),
      ).resolves.toBeUndefined();
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[PyPIPackageManagerName.uv], "latest"])(
    "should verify auth using uv %s",
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
            name: `verify_conditions_uv_${version.replaceAll(".", "_")}`,
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
            name: `verify_conditions_uv_${version.replaceAll(".", "_")}_a`,
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
            name: `verify_conditions_uv_${version.replaceAll(".", "_")}_b`,
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
      }

      let pkgContext: PyPIPackageContext;

      const getPluginPackageContext = () => pkgContext;
      const setPluginPackageContext = (
        type: string,
        name: string,
        context: PyPIPackageContext,
      ) => {
        pkgContext = context;
      };

      await expect(
        verifyConditions(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env,
            repositoryRoot: cwd,
            packages: packages.map(({ project }) => project),
          } as unknown as VerifyConditionsContext,
          {},
        ),
      ).resolves.toBeUndefined();
    },
  );
});
