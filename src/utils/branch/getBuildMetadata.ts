import { isBoolean, template } from "lodash-es";

import { CalVerBuildMetadataSpec } from "@lets-release/calver";
import { SemVerBuildMetadataSpec } from "@lets-release/semver";

export function getBuildMetadata(
  build: SemVerBuildMetadataSpec | CalVerBuildMetadataSpec,
  hash: string,
  pluginName?: string,
) {
  if (isBoolean(build)) {
    return hash;
  }

  if (typeof build === "string") {
    return template(build)({ hash });
  }

  if (pluginName) {
    const value = build[pluginName] ?? build.default;

    return !value || isBoolean(value) ? hash : template(value)({ hash });
  }

  return !build.default || isBoolean(build.default)
    ? hash
    : template(build.default)({ hash });
}
