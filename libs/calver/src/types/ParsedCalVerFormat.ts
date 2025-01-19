import { CalVerFormatTokens } from "src/types/CalVerFormatTokens";

export interface ParsedCalVerFormat {
  tokens: CalVerFormatTokens;
  regex: string;
}
