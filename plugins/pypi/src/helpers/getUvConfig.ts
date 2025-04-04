/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { existsSync } from "node:fs";
import { platform } from "node:os";
import path from "node:path";

import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { normalizePyProjectToml } from "src/helpers/normalizePyProjectToml";
import { normalizeUv } from "src/helpers/toml/normalizeUv";
import { readTomlFile } from "src/helpers/toml/readTomlFile";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

export async function getUvConfig(
  {
    env,
    package: { path: pkgRoot },
  }: Pick<FindPackagesContext, "env"> & {
    package: Pick<PackageInfo, "path">;
  },
  {
    pm: { root: workspaceRoot },
    pkg: { tool: { uv } = {} },
  }: Pick<PyPIPackageContext, "pm" | "pkg">,
) {
  // FIXME: use uv config command. https://github.com/astral-sh/uv/issues/6042
  // https://docs.astral.sh/uv/configuration/files/
  const workspaceUvToml = path.resolve(workspaceRoot, "uv.toml");
  const workspacePyProjectToml = path.resolve(workspaceRoot, "pyproject.toml");
  const projectLevelConfig = existsSync(workspaceUvToml)
    ? normalizeUv({ env }, await readTomlFile(workspaceUvToml))
    : workspaceRoot === pkgRoot
      ? uv
      : existsSync(workspacePyProjectToml)
        ? normalizePyProjectToml(
            { env },
            await readTomlFile(workspacePyProjectToml),
          ).tool?.uv
        : undefined;

  const os = platform();

  const userConfigDir = os === "win32" ? env.APPDATA : env.XDG_CONFIG_HOME;
  const userConfigDirAlternative =
    os === "win32"
      ? undefined
      : env.HOME
        ? path.resolve(env.HOME, ".config")
        : undefined;
  const userUvToml = userConfigDir
    ? path.resolve(userConfigDir, "uv", "uv.toml")
    : undefined;
  const userUvTomlAlternative = userConfigDirAlternative
    ? path.resolve(userConfigDirAlternative, "uv", "uv.toml")
    : undefined;
  const userLevelConfig =
    userUvToml && existsSync(userUvToml)
      ? normalizeUv({ env }, await readTomlFile(userUvToml))
      : userUvTomlAlternative && existsSync(userUvTomlAlternative)
        ? normalizeUv({ env }, await readTomlFile(userUvTomlAlternative))
        : undefined;

  const systemConfigDir =
    os === "win32"
      ? env.SYSTEMDRIVE
        ? path.resolve(env.SYSTEMDRIVE, "ProgramData")
        : undefined
      : env.XDG_CONFIG_DIRS;
  const systemConfigDirAlternative = os === "win32" ? undefined : "/etc";
  const systemUvToml = systemConfigDir
    ? path.resolve(systemConfigDir, "uv", "uv.toml")
    : undefined;
  const systemUvTomlAlternative = systemConfigDirAlternative
    ? path.resolve(systemConfigDirAlternative, "uv", "uv.toml")
    : undefined;
  const systemLevelConfig =
    systemUvToml && existsSync(systemUvToml)
      ? normalizeUv({ env }, await readTomlFile(systemUvToml))
      : systemUvTomlAlternative && existsSync(systemUvTomlAlternative)
        ? normalizeUv({ env }, await readTomlFile(systemUvTomlAlternative))
        : undefined;

  return {
    index: [
      ...(projectLevelConfig?.index ?? []),
      ...(userLevelConfig?.index ?? []),
      ...(systemLevelConfig?.index ?? []),
    ],
    checkUrl:
      projectLevelConfig?.checkUrl ||
      userLevelConfig?.checkUrl ||
      systemLevelConfig?.checkUrl,
    publishUrl:
      projectLevelConfig?.publishUrl ||
      userLevelConfig?.publishUrl ||
      systemLevelConfig?.publishUrl,
    devDependencies: [
      ...(projectLevelConfig?.devDependencies ?? []),
      ...(userLevelConfig?.devDependencies ?? []),
      ...(systemLevelConfig?.devDependencies ?? []),
    ],
  };
}
