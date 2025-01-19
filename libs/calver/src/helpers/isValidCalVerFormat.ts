import { parseCalVerFormat } from "src/helpers/parseCalVerFormat";

export function isValidCalVerFormat(format: string) {
  try {
    parseCalVerFormat(format);

    return true;
  } catch {
    return false;
  }
}
