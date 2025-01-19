import { isValidCalVer } from "src/helpers/isValidCalVer";

export function isValidCalVerXRange(format: string, range: string) {
  if (!/([._-]minor)?[._-]micro$/i.test(format)) {
    return false;
  }

  if (!/^(\d+[._-])+(x[._-])?x$/i.test(range)) {
    return false;
  }

  const tokens = format.split(/[._-]/);
  const values = range.split(/[._-]/);

  if (tokens.length < values.length) {
    return false;
  }

  if (/[._-]minor[._-]micro$/i.test(format)) {
    const majorFormat = format.replace(/[._-]minor[._-]micro$/i, "");

    return tokens.length === values.length
      ? isValidCalVer(
          majorFormat,
          range.replace(/(([._-]x){2}|[._-]\d+[._-]x)$/i, ""),
        )
      : isValidCalVer(majorFormat, range.replace(/[._-]x$/i, ""));
  }

  if (tokens.length !== values.length || !/^(\d+[._-])+x$/i.test(range)) {
    return false;
  }

  return isValidCalVer(
    format.replace(/[._-]micro$/i, ""),
    range.replace(/[._-]x$/i, ""),
  );
}
