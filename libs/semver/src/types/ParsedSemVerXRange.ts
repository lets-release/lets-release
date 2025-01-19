export interface ParsedSemVerXRange {
  major: number;
  minor: "*" | number;
  patch?: "*";
  min: string;
  max: string;
}
