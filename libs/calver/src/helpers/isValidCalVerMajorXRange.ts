import { isValidCalVerXRange } from "src/helpers/isValidCalVerXRange";

export function isValidCalVerMajorXRange(format: string, range: string) {
  if (!isValidCalVerXRange(format, range)) {
    return false;
  }

  if (!/[._-]minor[._-]micro$/i.test(format)) {
    return true;
  }

  const tokens = format.split(/[._-]/);
  const values = range.split(/[._-]/);

  if (tokens.length === values.length) {
    return /^(\d+[._-])+x[._-]x$/i.test(range);
  }

  return /^(\d+[._-])+x$/i.test(range);
}
