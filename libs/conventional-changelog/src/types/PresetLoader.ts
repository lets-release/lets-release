import { Preset } from "src/types/Preset";

export type PresetLoader = (obj?: object) => Promise<Preset>;
