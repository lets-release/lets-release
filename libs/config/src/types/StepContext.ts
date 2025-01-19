import { Step } from "src/enums/Step";
import { AddChannelsContext } from "src/types/AddChannelsContext";
import { AnalyzeCommitsContext } from "src/types/AnalyzeCommitsContext";
import { FailContext } from "src/types/FailContext";
import { FindPackagesContext } from "src/types/FindPackagesContext";
import { GenerateNotesContext } from "src/types/GenerateNotesContext";
import { PrepareContext } from "src/types/PrepareContext";
import { PublishContext } from "src/types/PublishContext";
import { SuccessContext } from "src/types/SuccessContext";
import { VerifyConditionsContext } from "src/types/VerifyConditionsContext";
import { VerifyReleaseContext } from "src/types/VerifyReleaseContext";

export type StepContext<T extends Step = Step> = {
  [Step.findPackages]: FindPackagesContext;
  [Step.verifyConditions]: VerifyConditionsContext;
  [Step.analyzeCommits]: AnalyzeCommitsContext;
  [Step.verifyRelease]: VerifyReleaseContext;
  [Step.generateNotes]: GenerateNotesContext;
  [Step.addChannels]: AddChannelsContext;
  [Step.prepare]: PrepareContext;
  [Step.publish]: PublishContext;
  [Step.success]: SuccessContext;
  [Step.fail]: FailContext;
}[T];
