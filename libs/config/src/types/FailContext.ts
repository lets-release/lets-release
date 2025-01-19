import { Step } from "src/enums/Step";
import { AddChannelsContext } from "src/types/AddChannelsContext";
import { PublishContext } from "src/types/PublishContext";

/**
 * Context used for the fail step.
 */
export type FailContext<
  T extends Step.addChannels | Step.publish = Step.addChannels | Step.publish,
> = {
  [Step.addChannels]: AddChannelsContext;
  [Step.publish]: PublishContext;
}[T] & {
  /**
   * Error that occurred during the release process.
   */
  error: unknown;
};
