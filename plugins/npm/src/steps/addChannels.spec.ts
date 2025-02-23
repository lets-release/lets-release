import { $ } from "execa";

import { AddChannelsContext } from "@lets-release/config";

import { addChannel } from "src/helpers/addChannel";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { addChannels } from "src/steps/addChannels";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("execa");
vi.mock("src/helpers/addChannel");
vi.mock("src/helpers/ensureNpmPackageContext");
vi.mock("src/helpers/getArtifactInfo");

const log = vi.fn();
const logger = { log };
const registry = "https://test.org";
const pkg = {
  name: "pkg",
  uniqueName: "npm/pkg",
};
const artifact = { name: pkg.name, url: registry };

class ExtendedPromise extends Promise<unknown> {
  stdout = {
    pipe: vi.fn(),
  };
  stderr = {
    pipe: vi.fn(),
  };
}
const promise = new ExtendedPromise((resolve) => {
  resolve(true);
});

vi.mocked($).mockReturnValue((() => promise) as never);
vi.mocked(getArtifactInfo).mockReturnValue(
  artifact as ReturnType<typeof getArtifactInfo>,
);

describe("addChannels", () => {
  beforeEach(() => {
    log.mockClear();
    vi.mocked($).mockClear();
    vi.mocked(addChannel).mockClear();
    vi.mocked(ensureNpmPackageContext)
      .mockReset()
      .mockResolvedValue({ pkg: {} } as NpmPackageContext);
    vi.mocked(getArtifactInfo).mockClear();
  });

  it("should skip add channels if skipPublishing is true", async () => {
    await expect(
      addChannels(
        {
          logger,
          package: pkg,
          nextRelease: {},
        } as unknown as AddChannelsContext,
        { skipPublishing: true },
      ),
    ).resolves.toBeUndefined();
  });

  it("should skip add channels if package.json's private property is true", async () => {
    vi.mocked(ensureNpmPackageContext)
      .mockReset()
      .mockResolvedValue({
        pkg: {
          private: true,
        },
      } as NpmPackageContext);

    await expect(
      addChannels(
        {
          logger,
          package: pkg,
          nextRelease: {},
        } as unknown as AddChannelsContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should add channels", async () => {
    await expect(
      addChannels(
        {
          logger,
          package: pkg,
          nextRelease: {
            version: "1.0.0",
            channels: [null, "next"],
          },
        } as unknown as AddChannelsContext,
        {},
      ),
    ).resolves.toBe(artifact);
  });
});
