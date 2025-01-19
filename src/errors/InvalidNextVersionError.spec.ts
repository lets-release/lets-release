import {
  Commit,
  Package,
  ReleaseBranch,
  ReleaseVersionRange,
} from "@lets-release/config";

import { InvalidNextVersionError } from "src/errors/InvalidNextVersionError";

describe("InvalidNextVersionError", () => {
  it("should be defined", () => {
    const error1 = new InvalidNextVersionError(
      {
        name: "package",
      } as Package,
      {
        min: "1.0.0",
        max: "2.0.0",
      } as ReleaseVersionRange,
      "3.0.0",
      {
        name: "branch",
      } as ReleaseBranch,
      [
        {
          commit: {
            short: "123",
          },
          subject: "subject 123",
        },
        {
          commit: {
            short: "456",
          },
          subject: "subject 456",
        },
      ] as Commit[],
      [
        {
          name: "next",
        },
      ] as ReleaseBranch[],
    );
    const error2 = new InvalidNextVersionError(
      {
        name: "package",
      } as Package,
      {
        min: "1.0.0",
        max: "2.0.0",
      } as ReleaseVersionRange,
      "3.0.0",
      {
        name: "branch",
      } as ReleaseBranch,
      [
        {
          commit: {
            short: "123",
          },
          subject: "subject 123",
        },
      ] as Commit[],
      [] as ReleaseBranch[],
    );
    const error3 = new InvalidNextVersionError(
      {
        name: "package",
      } as Package,
      {
        min: "1.0.0",
        max: "2.0.0",
      } as ReleaseVersionRange,
      "3.0.0",
      {
        name: "branch",
      } as ReleaseBranch,
      [
        {
          commit: {
            short: "123",
          },
          subject: "subject 123",
        },
      ] as Commit[],
      [
        {
          name: "next",
        },
        {
          name: "next-major",
        },
      ] as ReleaseBranch[],
    );

    expect(error1.message).toEqual(
      expect.stringContaining("The release `3.0.0` of package `package`"),
    );
    expect(error1.details).toEqual(
      expect.stringContaining(
        "Based on the releases of package `package` published",
      ),
    );
    expect(error2.message).toEqual(
      expect.stringContaining("The release `3.0.0` of package `package`"),
    );
    expect(error2.details).toEqual(
      expect.stringContaining(
        "Based on the releases of package `package` published",
      ),
    );
    expect(error3.message).toEqual(
      expect.stringContaining("The release `3.0.0` of package `package`"),
    );
    expect(error3.details).toEqual(
      expect.stringContaining(
        "Based on the releases of package `package` published",
      ),
    );
  });
});
