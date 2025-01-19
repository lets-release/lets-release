import { getMaskingHandler } from "src/utils/getMaskingHandler";

export function maskObject<T>(env: NodeJS.ProcessEnv, obj: T) {
  const handler = getMaskingHandler(env);

  for (const prop of Object.getOwnPropertyNames(obj) as (keyof typeof obj)[]) {
    if (!obj[prop]) {
      continue;
    }

    obj[prop] =
      typeof obj[prop] === "object"
        ? maskObject(env, obj[prop])
        : handler(obj[prop]);
  }

  return obj;
}
