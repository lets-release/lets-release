import { SEPARATOR } from "src/constants/SEPARATOR";
import { CalVerToken } from "src/enums/CalVerToken";
import { isValidCalVer } from "src/helpers/isValidCalVer";
import { isValidCalVerFormat } from "src/helpers/isValidCalVerFormat";

export function isValidCalVerXRange(format: string, range: string) {
  if (!isValidCalVerFormat(format)) {
    return false;
  }

  const formatRegExp = new RegExp(
    `(${SEPARATOR}${CalVerToken.MINOR})?${SEPARATOR}${CalVerToken.MICRO}$`,
  );
  const trimmedFormat = format.trim().toUpperCase();

  if (!formatRegExp.test(trimmedFormat)) {
    return false;
  }

  const rangeRegExp = new RegExp(
    String.raw`^(\d+${SEPARATOR})+(x${SEPARATOR})?x$`,
  );
  const trimmedRange = range.trim().toLowerCase();

  if (!rangeRegExp.test(trimmedRange)) {
    return false;
  }

  const separatorRegExp = new RegExp(SEPARATOR);
  const tokens = trimmedFormat.split(separatorRegExp);
  const values = trimmedRange.split(separatorRegExp);

  if (tokens.length < values.length) {
    return false;
  }

  const minorMicroRegExp = new RegExp(
    `${SEPARATOR}${CalVerToken.MINOR}${SEPARATOR}${CalVerToken.MICRO}$`,
  );
  const xRegExp = new RegExp(`${SEPARATOR}x$`);

  if (minorMicroRegExp.test(trimmedFormat)) {
    const majorFormat = trimmedFormat.replace(minorMicroRegExp, "");

    return tokens.length === values.length
      ? isValidCalVer(
          majorFormat,
          trimmedRange.replace(
            new RegExp(
              String.raw`((${SEPARATOR}x){2}|${SEPARATOR}\d+${SEPARATOR}x)$`,
            ),
            "",
          ),
        )
      : isValidCalVer(majorFormat, trimmedRange.replace(xRegExp, ""));
  }

  const minorRangeRegExp = new RegExp(String.raw`^(\d+${SEPARATOR})+x$`);

  if (tokens.length !== values.length || !minorRangeRegExp.test(trimmedRange)) {
    return false;
  }

  return isValidCalVer(
    trimmedFormat.replace(new RegExp(`${SEPARATOR}${CalVerToken.MICRO}$`), ""),
    trimmedRange.replace(xRegExp, ""),
  );
}
