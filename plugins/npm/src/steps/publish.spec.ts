import { $ } from "execa";
import { NormalizedPackageJson } from "read-pkg";

import { PublishContext } from "@lets-release/config";

import { addChannel } from "src/helpers/addChannel";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { getPackage } from "src/helpers/getPackage";
import { isVersionPublished } from "src/helpers/isVersionPublished";
import { preparePackage } from "src/helpers/preparePackage";
import { publish } from "src/steps/publish";

vi.mock("execa");
vi.mock("src/helpers/addChannel");
vi.mock("src/helpers/ensureNpmPackageContext");
vi.mock("src/helpers/getPackage");
vi.mock("src/helpers/getArtifactInfo");
vi.mock("src/helpers/isVersionPublished");
vi.mock("src/helpers/preparePackage");

const log = vi.fn();
const warn = vi.fn();
const logger = { log, warn };
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

describe("publish", () => {
  beforeEach(() => {
    log.mockClear();
    vi.mocked($).mockClear();
    vi.mocked(addChannel).mockClear();
    vi.mocked(ensureNpmPackageContext)
      .mockReset()
      .mockResolvedValue({ cwd: "cwd", registry });
    vi.mocked(getPackage).mockReset();
    vi.mocked(getArtifactInfo).mockClear();
    vi.mocked(isVersionPublished).mockReset();
    vi.mocked(preparePackage).mockClear();
  });

  it("should skip publish if skipPublishing is true", async () => {
    vi.mocked(getPackage).mockResolvedValue({} as NormalizedPackageJson);

    await expect(
      publish(
        {
          logger,
          package: pkg,
          nextRelease: {},
        } as unknown as PublishContext,
        { skipPublishing: true },
      ),
    ).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledTimes(1);
  });

  it("should skip publish if package.json's private property is true", async () => {
    vi.mocked(getPackage).mockResolvedValue({
      private: true,
    } as NormalizedPackageJson);

    await expect(
      publish(
        {
          logger,
          package: pkg,
          nextRelease: {},
        } as unknown as PublishContext,
        {},
      ),
    ).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledTimes(1);
  });

  it("should skip publish if version is already published", async () => {
    vi.mocked(getPackage).mockResolvedValue({} as NormalizedPackageJson);
    vi.mocked(isVersionPublished).mockResolvedValue(true);

    await expect(
      publish(
        {
          logger,
          package: pkg,
          nextRelease: { version: "1.0.0", channels: [null] },
        } as unknown as PublishContext,
        {},
      ),
    ).resolves.toBe(artifact);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("should publish package with pnpm", async () => {
    vi.mocked(ensureNpmPackageContext).mockResolvedValue({
      pm: {
        name: "pnpm",
        version: "1",
      },
      cwd: "cwd",
      registry,
    });
    vi.mocked(getPackage).mockResolvedValue({} as NormalizedPackageJson);

    await expect(
      publish(
        {
          logger,
          package: pkg,
          nextRelease: { version: "1.0.0", channels: [null] },
        } as unknown as PublishContext,
        {},
      ),
    ).resolves.toBe(artifact);
    expect(log).toHaveBeenCalledTimes(2);
    expect(preparePackage).toHaveBeenCalledTimes(1);
  });

  it("should publish package with yarn", async () => {
    vi.mocked(ensureNpmPackageContext).mockResolvedValue({
      pm: {
        name: "yarn",
        version: "1",
      },
      cwd: "cwd",
      registry,
    });
    vi.mocked(getPackage).mockResolvedValue({} as NormalizedPackageJson);

    await expect(
      publish(
        {
          logger,
          package: pkg,
          nextRelease: { version: "1.0.0", channels: [null] },
        } as unknown as PublishContext,
        {},
      ),
    ).resolves.toBe(artifact);
    expect(log).toHaveBeenCalledTimes(2);
    expect(preparePackage).toHaveBeenCalledTimes(1);
  });

  it("should publish package with npm", async () => {
    vi.mocked(ensureNpmPackageContext).mockResolvedValue({
      cwd: "cwd",
      registry,
    });
    vi.mocked(getPackage).mockResolvedValue({} as NormalizedPackageJson);

    await expect(
      publish(
        {
          logger,
          package: pkg,
          nextRelease: {
            version: "1.0.0",
            channels: ["next", "next-major"],
          },
        } as unknown as PublishContext,
        {},
      ),
    ).resolves.toBe(artifact);
    expect(log).toHaveBeenCalledTimes(2);
    expect(preparePackage).toHaveBeenCalledTimes(1);
  });
});
