import { filterRevertedCommitsSync } from "conventional-commits-filter";
import { CommitParser, ParserOptions } from "conventional-commits-parser";
import debug from "debug";

import { Commit, Package } from "@lets-release/config";

import { name } from "src/plugin";
import { ParsedCommit } from "src/types/ParsedCommit";

export function parseCommits(
  pkg: Package,
  commits: Commit[],
  parserOptions: ParserOptions,
) {
  return [
    ...filterRevertedCommitsSync<ParsedCommit>(
      commits
        .filter(({ hash, message }: Commit) => {
          if (!message.trim()) {
            debug(`${name}:${pkg.uniqueName}`)(
              `Skip commit ${hash} with empty message`,
            );

            return false;
          }

          return true;
        })
        .map<ParsedCommit>(
          ({ message, ...commitProps }: Commit) =>
            ({
              rawMsg: message,
              message,
              ...commitProps,
              ...new CommitParser(parserOptions).parse(message),
            }) as ParsedCommit,
        ),
    ),
  ];
}
