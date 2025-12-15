import { SEPARATOR } from "src/constants/SEPARATOR";
import { CalVerToken } from "src/enums/CalVerToken";
import { isValidCalVerXRange } from "src/helpers/isValidCalVerXRange";

export function isValidCalVerMajorXRange(format: string, range: string) {
  if (!isValidCalVerXRange(format, range)) {
    return false;
  }

  const trimmedFormat = format.trim().toUpperCase();

  if (
    !new RegExp(
      `${SEPARATOR}${CalVerToken.MINOR}${SEPARATOR}${CalVerToken.MICRO}$`,
    ).test(trimmedFormat)
  ) {
    return true;
  }

  const trammedRange = range.trim().toLowerCase();

  const separatorRegExp = new RegExp(SEPARATOR);
  const tokens = trimmedFormat.split(separatorRegExp);
  const values = trammedRange.split(separatorRegExp);

  if (tokens.length === values.length) {
    return new RegExp(String.raw`^(\d+${SEPARATOR})+x${SEPARATOR}x$`).test(
      trammedRange,
    );
  }

  return new RegExp(String.raw`^(\d+${SEPARATOR})+x$`).test(trammedRange);
}
