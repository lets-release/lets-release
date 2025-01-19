import issueParser, { Options } from "issue-parser";
import { isNil, uniq } from "lodash-es";

export function parseIssues(
  type: Options,
  owner: string,
  repo: string,
  messages: (string | undefined)[],
  host?: string,
) {
  const parser = issueParser(type, host ? { hosts: [host] } : {});

  return uniq(
    messages.flatMap((message?: string) =>
      message
        ? parser(message)
            .actions.close.filter(
              (action) =>
                isNil(action.slug) || action.slug === `${owner}/${repo}`,
            )
            .map((action) => Number.parseInt(action.issue, 10))
        : [],
    ),
  );
}
