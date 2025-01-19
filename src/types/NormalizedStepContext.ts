import {
  NextRelease,
  NormalizedNextRelease,
  Step,
  StepContext,
} from "@lets-release/config";

interface NormalizedContextHelpers {
  getPluginContext: <T>(pluginName: string) => T | undefined;
  setPluginContext: <T>(pluginName: string, pluginContext: T) => void;
  getPluginPackageContext: <T>(
    pluginName: string,
    packageName: string,
  ) => T | undefined;
  setPluginPackageContext: <T>(
    pluginName: string,
    packageName: string,
    pluginPackageContext: T,
  ) => void;
}

export type PartialNormalizedStepContext<T extends Step = Step> = Omit<
  StepContext<T>,
  | "nextRelease"
  | "getPluginContext"
  | "setPluginContext"
  | "getPluginPackageContext"
  | "setPluginPackageContext"
> &
  (StepContext<T> extends { nextRelease: NextRelease }
    ? {
        nextRelease: NormalizedNextRelease;
      }
    : { nextRelease?: undefined });

export type NormalizedStepContext<T extends Step = Step> =
  PartialNormalizedStepContext<T> & NormalizedContextHelpers;
