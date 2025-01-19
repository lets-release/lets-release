import { Options as WriterOptions } from "conventional-changelog-writer";
import { ParserOptions } from "conventional-commits-parser";

export interface Preset {
  parser: ParserOptions;
  writer: WriterOptions;
}
