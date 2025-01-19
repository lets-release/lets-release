import { Step } from "@lets-release/config";

export type StepCommand<T extends Step = Step> = `${T}Cmd`;
