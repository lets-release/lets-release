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
      commits.flatMap(({ hash, message, ...rest }: Commit) => {
        if (!message.trim()) {
          debug(`${name}:${pkg.uniqueName}`)(
            `Skip commit ${hash} with empty message`,
          );

          return [];
        }

        return [
          {
            hash,
            rawMsg: message,
            message,
            ...rest,
            ...new CommitParser(parserOptions).parse(message),
          },
        ] as ParsedCommit[];
      }),
    ),
  ];
}
