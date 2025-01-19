/**
 * Commit information.
 */
export interface Commit {
  /**
   * The commit abbreviated and full hash.
   */
  commit: {
    /**
     * The commit hash.
     */
    long: string;

    /**
     * The commit abbreviated hash.
     */
    short: string;
  };

  /**
   * The commit abbreviated and full tree hash.
   */
  tree: {
    /**
     * The commit tree hash.
     */
    long: string;

    /**
     * The commit abbreviated tree hash.
     */
    short: string;
  };

  /**
   * The commit author information.
   */
  author: {
    /**
     * The commit author name.
     */
    name: string;

    /**
     * The commit author email.
     */
    email: string;

    /**
     * The commit author date.
     */
    date: Date;
  };

  /**
   * The committer information.
   */
  committer: {
    /**
     * The committer name.
     */
    name: string;

    /**
     * The committer email.
     */
    email: string;

    /**
     * The committer date.
     */
    date: Date;
  };

  /**
   * The commit subject.
   */
  subject: string;

  /**
   * The commit body.
   */
  body: string;

  /**
   * The commit has.
   *
   * May used by `conventional-changelog` libs.
   */
  hash: string;

  /**
   * The commit full message (subject and body).
   */
  message: string;

  /**
   * List of git tags. See https://git-scm.com/docs/git-log#Documentation/git-log.txt-emdem
   *
   * May used by `conventional-changelog` libs.
   */
  gitTags: string;

  /**
   * The committer date.
   *
   * May used by `conventional-changelog` libs.
   */
  committerDate: Date;
}
