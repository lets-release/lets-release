import { SEPARATOR } from "src/constants/SEPARATOR";
import { CalVerToken } from "src/enums/CalVerToken";
import { isValidCalVerXRange } from "src/helpers/isValidCalVerXRange";

export function isValidCalVerMajorXRange(format: string, range: string) {
  if (!isValidCalVerXRange(format, range)) {
    return false;
  }

  const formatRegExp = new RegExp(
    `${SEPARATOR}${CalVerToken.MINOR}${SEPARATOR}${CalVerToken.MICRO}$`,
  );
  const trimmedFormat = format.trim().toUpperCase();

  if (!formatRegExp.test(trimmedFormat)) {
    return true;
  }

  const trammedRange = range.trim().toLowerCase();

  const separatorRegExp = new RegExp(SEPARATOR);
  const tokens = trimmedFormat.split(separatorRegExp);
  const values = trammedRange.split(separatorRegExp);

  if (tokens.length === values.length) {
    const minorMicroRegExp = new RegExp(
      String.raw`^(\d+${SEPARATOR})+x${SEPARATOR}x$`,
    );

    return minorMicroRegExp.test(trammedRange);
  }

  const minorRegExp = new RegExp(String.raw`^(\d+${SEPARATOR})+x$`);

  return minorRegExp.test(trammedRange);
}
