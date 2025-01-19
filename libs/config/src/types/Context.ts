/**
 * lets-release context specific for API usage.
 **/
export interface Context {
  /**
   * The current working directory to use. It should be configured to
   * the root of the Git repository to release from.
   *
   * It allows to run lets-release from a specific path without
   * having to change the local process cwd with process.chdir().
   *
   * @default process.cwd
   */
  cwd?: string;

  /**
   * The environment variables to use.
   *
   * It allows to run lets-release with specific environment
   * variables without having to modify the local process.env.
   *
   * @default process.env
   */
  env?: NodeJS.ProcessEnv;

  /**
   * The writable stream used to log information.
   *
   * It allows to configure lets-release to write logs to a specific
   * stream rather than the local process.stdout.
   *
   * @default process.stdout
   */
  stdout?: NodeJS.WriteStream;

  /**
   * The writable stream used to log errors.
   *
   * It allows to configure lets-release to write errors to a
   * specific stream rather than the local process.stderr.
   *
   * @default process.stderr
   */
  stderr?: NodeJS.WriteStream;
}
