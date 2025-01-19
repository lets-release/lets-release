import { $ } from "execa";
import { NormalizedPackageJson } from "read-pkg";

import { AddChannelsContext } from "@lets-release/config";

import { addChannel } from "src/helpers/addChannel";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { getPackage } from "src/helpers/getPackage";
import { addChannels } from "src/steps/addChannels";

vi.mock("execa");
vi.mock("src/helpers/addChannel");
vi.mock("src/helpers/ensureNpmPackageContext");
vi.mock("src/helpers/getPackage");
vi.mock("src/helpers/getArtifactInfo");

const log = vi.fn();
const logger = { log };
const registry = "https://test.org";
const name = "test";
const pkg = { path: "/root/a", name };
const artifact = { name, url: registry };

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
    vi.mocked(ensureNpmPackageContext).mockClear();
    vi.mocked(getPackage).mockClear();
    vi.mocked(getArtifactInfo).mockClear();
  });

  it("should skip add channels if skipPublishing is true", async () => {
    vi.mocked(getPackage).mockResolvedValue({} as NormalizedPackageJson);

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
    vi.mocked(getPackage).mockResolvedValue({
      private: true,
    } as NormalizedPackageJson);

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
    vi.mocked(getPackage).mockResolvedValue({} as NormalizedPackageJson);

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
