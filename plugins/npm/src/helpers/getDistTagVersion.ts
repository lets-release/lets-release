import { $, ResultPromise } from "execa";

import { VerifyReleaseContext } from "@lets-release/config";

import { NpmPackageContext } from "src/types/NpmPackageContext";

export async function getDistTagVersion(
  { env, package: { name } }: VerifyReleaseContext,
  { pm, registry }: NpmPackageContext,
  distTag: string,
) {
  const options = {
    cwd: pm.root,
    env,
    lines: true as const,
    preferLocal: true as const,
  };
  const getVersion = async (
    promise: ResultPromise<typeof options>,
    { json }: { json: boolean } = { json: false },
  ) => {
    const { stdout } = await promise;

    // Yarn outputs JSON
    if (json) {
      return stdout
        .filter((line) => !!line.trim())
        .map((line) => JSON.parse(line.trim()))
        .find(({ descriptor }) => descriptor === `${name}@${distTag}`)
        ?.locator.split("@")
        .at(-1);
    }

    return stdout
      .filter((line) => !!line.trim())
      .map((line) => line.split(":").map((part) => part.trim()))
      .find(([tag]) => tag === distTag)?.[1];
  };

  switch (pm.name) {
    case "pnpm": {
      return await getVersion(
        $(options)`pnpm dist-tag ls ${name} --registry ${registry}`,
      );
    }

    case "yarn": {
      return await getVersion($(options)`yarn npm tag list ${name} --json`, {
        json: true,
      });
    }

    default: {
      return await getVersion(
        $(options)`npm dist-tag ls ${name} --registry ${registry}`,
      );
    }
  }
}
