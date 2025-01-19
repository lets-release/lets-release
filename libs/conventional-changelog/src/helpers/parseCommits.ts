import { filterRevertedCommitsSync } from "conventional-commits-filter";
import { CommitParser, ParserOptions } from "conventional-commits-parser";
import { debug } from "debug";

import { Commit } from "@lets-release/config";

import { ParsedCommit } from "src/types/ParsedCommit";

const namespace = "@lets-release/conventional-changelog";

export function parseCommits(commits: Commit[], parserOptions: ParserOptions) {
  return [
    ...filterRevertedCommitsSync<ParsedCommit>(
      commits
        .filter(({ hash, message }: Commit) => {
          if (!message.trim()) {
            debug(namespace)(`Skip commit ${hash} with empty message`);

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
