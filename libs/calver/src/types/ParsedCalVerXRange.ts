export type ParsedCalVerXRange = (
  | {
      major: string;
      minor: "*" | number;
      micro?: "*";
    }
  | {
      major: string;
      micro: "*";
    }
) & {
  min: string;
  max: string;
};
