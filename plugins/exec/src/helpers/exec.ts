import path from "node:path";

import { $ } from "execa";
import { template } from "lodash-es";

import { Step, StepContext } from "@lets-release/config";

import { ExecOptions } from "src/schemas/ExecOptions";
import { StepCommand } from "src/types/StepCommand";

export async function exec<T extends Step>(
  cmd: StepCommand<T>,
  { cwd, env, stdout, stderr, logger, ...context }: StepContext<T>,
  { shell, cwd: execCwd, ...options }: ExecOptions,
) {
  const script = template(options[cmd])({ ...context, ...options });
  const { package: pkg } = context as unknown as Partial<
    StepContext<Step.analyzeCommits>
  >;

  logger.log({
    prefix: pkg ? `[${pkg.uniqueName}]` : undefined,
    message: `Call script ${script}`,
  });

  const result = $({
    shell: shell || true,
    cwd: execCwd ? path.resolve(cwd, execCwd) : cwd,
    env,
  })`${script}`;

  result.stdout.pipe(stdout, { end: false });
  result.stderr.pipe(stderr, { end: false });

  const output = await result;

  return output.stdout.trim();
}
