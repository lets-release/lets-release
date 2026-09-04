import {
  ConventionalGitClient,
  GetCommitsParams,
  GetSemverTagsParams,
} from "@conventional-changelog/git-client";
import {
  Commit as ConventionalCommit,
  ParserStreamOptions,
} from "conventional-commits-parser";

import { Commit, Package } from "@lets-release/config";
import { parseCommits } from "@lets-release/conventional-changelog";

export class ProvidedCommitsGitClient extends ConventionalGitClient {
  constructor(
    cwd: string,
    private readonly pkg: Package,
    private readonly commits: Commit[],
  ) {
    super(cwd);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async *getCommits(
    _params?: GetCommitsParams,
    parserOptions?: ParserStreamOptions,
  ): AsyncGenerator<ConventionalCommit> {
    yield* parseCommits(
      this.pkg,
      this.commits,
      parserOptions ?? {},
    ) as unknown as ConventionalCommit[];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async *getSemverTags(
    _params?: GetSemverTagsParams,
  ): AsyncGenerator<string> {
    yield* [];
  }

  override verify(rev: string): Promise<string> {
    return Promise.resolve(rev);
  }
}
