import { cosmiconfig } from "cosmiconfig";
import debug from "debug";
import { isNil, pickBy } from "lodash-es";

import { BaseContext, NormalizedOptions, Options } from "@lets-release/config";

import { name } from "src/program";
import { getRepoUrl } from "src/utils/getRepoUrl";
import { getRemoteUrl } from "src/utils/git/getRemoteUrl";

const namespace = `${name}:utils.loadConfig`;
const configFileName = "release";

export async function loadConfig(
  partialOptions: Partial<Options>,
  { env, repositoryRoot }: Pick<BaseContext, "env" | "repositoryRoot">,
): Promise<NormalizedOptions> {
  const { config, filepath } = ((await cosmiconfig(configFileName).search(
    repositoryRoot,
  )) ?? {}) as {
    config?: object;
    filepath?: string;
  };

  debug(namespace)(`config loaded from: ${filepath}`);

  // Set repository url and verify options
  const options = (await Options.required({ repositoryUrl: true }).parseAsync({
    repositoryUrl:
      (await getRepoUrl({ cwd: repositoryRoot, normalize: false })) ??
      (await getRemoteUrl("origin", { cwd: repositoryRoot, env })),
    // Remove `null` and `undefined` options, so they can be replaced with default ones
    ...pickBy(
      {
        ...config,
        ...partialOptions,
      },
      (option: unknown) => !isNil(option),
    ),
  })) as NormalizedOptions;

  debug(namespace)("options values: %O", options);

  return options;
}
