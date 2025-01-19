declare module "conventional-changelog-conventionalcommits" {
  import { PresetLoader } from "src/types/PresetLoader";

  const loadPreset: PresetLoader;

  export default loadPreset;
}
