import { CalVerToken } from "src/enums/CalVerToken";

export interface CalVerFormatTokens {
  year: CalVerToken.YYYY | CalVerToken.YY | CalVerToken.Y;
  week?: CalVerToken.WW | CalVerToken.W;
  month?: CalVerToken.MM | CalVerToken.M;
  day?: CalVerToken.DD | CalVerToken.D;
  minor?: CalVerToken.MINOR;
  micro?: CalVerToken.MICRO;
}
