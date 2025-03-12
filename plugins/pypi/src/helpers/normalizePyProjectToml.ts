import { TomlPrimitive } from "smol-toml";

import { NoPyPIPackageNameError } from "src/errors/NoPyPIPackageNameError";
import { getMaybeValue } from "src/helpers/toml/getMaybeValue";
import { isArray } from "src/helpers/toml/isArray";
import { isArrayOf } from "src/helpers/toml/isArrayOf";
import { isObject } from "src/helpers/toml/isObject";
import { isString } from "src/helpers/toml/isString";
import { normalizeRegistry } from "src/helpers/toml/normalizeRegistry";
import { normalizeUv } from "src/helpers/toml/normalizeUv";
import { NormalizedPyProjectToml } from "src/types/NormalizedPyProjectToml";

export function normalizePyProjectToml(
  raw: Record<string, TomlPrimitive>,
): NormalizedPyProjectToml {
  const project = getMaybeValue(raw.project, isObject);
  const name = getMaybeValue(project?.name, isString);
  const version = getMaybeValue(project?.version, isString);
  const classifiers = getMaybeValue(project?.classifiers, isArray)?.filter(
    isString,
  );
  const dependencies = getMaybeValue(project?.dependencies, isArray)?.filter(
    isString,
  );
  const optionalDependencies = Object.fromEntries(
    Object.entries(
      getMaybeValue(project?.["optional-dependencies"], isObject) ?? {},
    ).flatMap(([key, value]) => {
      if (isArrayOf(value, isString)) {
        return [[key, value]];
      }

      return [];
    }),
  );

  if (!name) {
    throw new NoPyPIPackageNameError();
  }

  const dependencyGroups = Object.fromEntries(
    Object.entries(
      getMaybeValue(raw["dependency-groups"], isObject) ?? {},
    ).flatMap(([key, value]) => {
      if (isArrayOf(value, isString)) {
        return [[key, value]];
      }

      return [];
    }),
  );

  // normalize the `tool` object
  const tool = getMaybeValue(raw.tool, isObject);

  const uvRaw = getMaybeValue(tool?.uv, isObject);
  const uv = uvRaw ? normalizeUv(uvRaw) : undefined;

  const poetry = getMaybeValue(tool?.poetry, isObject);
  const poetryDependencies = getMaybeValue(poetry?.dependencies, isObject);
  const group = Object.fromEntries(
    Object.entries(getMaybeValue(poetry?.group, isObject) ?? {}).flatMap(
      ([key, value]) => {
        if (!isObject(value)) {
          return [];
        }

        const dependencies = getMaybeValue(value.dependencies, isObject);

        return [[key, { dependencies }]];
      },
    ),
  );

  const letsRelease = getMaybeValue(tool?.["lets-release"], isObject);
  const registry = normalizeRegistry(
    getMaybeValue(letsRelease?.registry, isObject),
  );
  const token = getMaybeValue(letsRelease?.token, isString);
  const username = getMaybeValue(letsRelease?.username, isString);
  const password = getMaybeValue(letsRelease?.password, isString);

  return {
    project: {
      name,
      version,
      classifiers,
      dependencies,
      optionalDependencies,
    },
    dependencyGroups,
    tool: {
      uv,
      poetry: {
        dependencies: poetryDependencies,
        group,
      },
      letsRelease: {
        registry,
        token,
        username,
        password,
      },
    },
  };
}
