import { escapeRegExp, isString, size } from "lodash-es";

import { SECRET_MIN_SIZE } from "src/constants/SECRET_MIN_SIZE";
import { SECRET_REPLACEMENT } from "src/constants/SECRET_REPLACEMENT";

export function getMaskingHandler(env: NodeJS.ProcessEnv) {
  const toReplace = Object.entries(env).filter(
    (entry): entry is [string, string] => {
      const [key, value] = entry;

      // https://github.com/semantic-release/semantic-release/issues/1558
      if (key === "GOPRIVATE") {
        return false;
      }

      return (
        /token|password|credential|secret|private/i.test(key) &&
        size(value?.trim()) >= SECRET_MIN_SIZE
      );
    },
  );

  const regexp = new RegExp(
    toReplace
      .map(
        ([, value]) =>
          `${escapeRegExp(value)}|${escapeRegExp(encodeURI(value))}`,
      )
      .join("|"),
    "g",
  );

  return <T>(output: T): T =>
    output && isString(output) && toReplace.length > 0
      ? (output.toString().replace(regexp, SECRET_REPLACEMENT) as T)
      : output;
}
