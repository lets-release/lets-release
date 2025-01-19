import { VersioningScheme } from "@lets-release/config";

import { normalizeChannels } from "src/utils/branch/normalizeChannels";
import { normalizePrereleaseName } from "src/utils/branch/normalizePrereleaseName";
import { normalizePrereleaseNameSpec } from "src/utils/branch/normalizePrereleaseNameSpec";
import { normalizePrereleaseOptions } from "src/utils/branch/normalizePrereleaseOptions";

vi.mock("src/utils/branch/normalizeChannels");
vi.mock("src/utils/branch/normalizePrereleaseName");
vi.mock("src/utils/branch/normalizePrereleaseNameSpec");

const channels = { default: ["channel1"] };

vi.mocked(normalizeChannels).mockReturnValue(channels);

describe("normalizePrereleaseOptions", () => {
  beforeEach(() => {
    vi.mocked(normalizePrereleaseName).mockReset();
    vi.mocked(normalizePrereleaseNameSpec).mockReset();
  });

  it("should return undefined if options is nil and defaultName is invalid", () => {
    expect(normalizePrereleaseOptions("test")).toBeUndefined();
  });

  it("should return normalized options if options is nil and defaultName is valid", () => {
    vi.mocked(normalizePrereleaseName).mockReturnValue("defaultName");

    expect(normalizePrereleaseOptions("test")).toEqual({
      name: { default: "defaultName" },
      channels,
    });
  });

  it("should return undefined if options.name is present but normalized.default is undefined", () => {
    vi.mocked(normalizePrereleaseNameSpec).mockReturnValue({});

    expect(
      normalizePrereleaseOptions("test", { name: "name" }),
    ).toBeUndefined();
  });

  it("should return normalized options if options.name is present and normalized.default is valid", () => {
    vi.mocked(normalizePrereleaseNameSpec).mockReturnValue({
      default: "defaultName",
    });

    expect(normalizePrereleaseOptions("test", { name: "name" })).toEqual({
      name: { default: "defaultName" },
      channels,
    });
  });

  it("should return undefined if options.names does not contain valid normalized names", () => {
    vi.mocked(normalizePrereleaseNameSpec)
      .mockRejectedValueOnce({ default: "defaultName" })
      .mockReturnValue({});

    expect(
      normalizePrereleaseOptions("test", {
        names: { SemVer: "semver", CalVer: "calver" },
      }),
    ).toBeUndefined();
  });

  it("should return normalized options if options.names contain valid normalized names", () => {
    vi.mocked(normalizePrereleaseNameSpec).mockImplementation(
      (name, scheme) => {
        if (scheme === VersioningScheme.SemVer) {
          return { default: "semverDefault" };
        }

        if (scheme === VersioningScheme.CalVer) {
          return { default: "calverDefault" };
        }

        return {};
      },
    );

    expect(
      normalizePrereleaseOptions("test", {
        names: { SemVer: "semver", CalVer: "calver" },
      }),
    ).toEqual({
      names: {
        SemVer: { default: "semverDefault" },
        CalVer: { default: "calverDefault" },
      },
      channels,
    });
  });
});
