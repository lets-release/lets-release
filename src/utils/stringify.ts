import { inspect } from "node:util";

import { isString } from "lodash-es";

export function stringify(value: unknown) {
  return isString(value)
    ? value
    : inspect(value, { breakLength: Infinity, depth: 2, maxArrayLength: 5 });
}
