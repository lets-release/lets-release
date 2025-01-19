#!/usr/bin/env node

import { cac } from "cac";
import { debug } from "debug";

import { CliOptions } from "@lets-release/config";

import { LetsRelease } from "src/LetsRelease";
import { name, version } from "src/program";

async function command() {
  const { options } = cac("lets-release")
    .option("-p, --prerelease <string>", "Prereleases option key")
    .option("-d, --dry-run", "Skip publishing")
    .option("-s, --skip-ci-verifications", "Skip CI verifications")
    .option("-D, --debug", "Output debugging information")
    .version(version)
    .help()
    .usage("[options]")
    .parse();

  if (options.help || options.version) {
    return;
  }

  if (options.debug) {
    debug.enable(`${name}:*,@${name}/*`);
  }

  await new LetsRelease().run(await CliOptions.parseAsync(options));
}

await command();
