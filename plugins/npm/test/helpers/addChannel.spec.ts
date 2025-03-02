import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson } from "fs-extra";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PublishContext, VerifyReleaseContext } from "@lets-release/config";

import { addChannel } from "src/helpers/addChannel";
import { getDistTagVersion } from "src/helpers/getDistTagVersion";
import { prepare } from "src/steps/prepare";
import { publish } from "src/steps/publish";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const registry = inject("registry");
const registryHost = inject("registryHost");
const npmToken = inject("npmToken");
const stdout = new WritableStreamBuffer();
const stderr = new WritableStreamBuffer();
const log = vi.fn();
const warn = vi.fn();
const logger = { log, warn };
const pkg = {
  name: "add-channel-helper-npm",
  version: "2.0.0",
  publishConfig: { registry },
  path: "",
};
const context = {
  stdout,
  stderr,
  logger,
  package: pkg,
};

describe("addChannel", () => {
  describe("npm latest", () => {
    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

    beforeAll(async () => {
      const cwd = temporaryDirectory();

      pkg.path = cwd;

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      await outputJson(path.resolve(cwd, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use npm@latest`;
      await $(options)`npm install`;

      const ctx = {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: pkg,
        nextRelease: {
          version: pkg.version,
          channels: [null],
        },
      } as unknown as PublishContext;
      await prepare(ctx, {});
      await publish(ctx, {});
    });

    it("should skip add channel if the current version is less than the version on dist-tag", async () => {
      await addChannel(
        {
          ...context,
          nextRelease: { version: "1.0.0" },
        } as unknown as VerifyReleaseContext,
        pkgContext,
        "latest",
      );
      await expect(
        getDistTagVersion(
          context as unknown as VerifyReleaseContext,
          pkgContext,
          "latest",
        ),
      ).resolves.toBe("2.0.0");
    });

    it("should skip add channel if the current version is equal to the version on dist-tag", async () => {
      await addChannel(
        {
          ...context,
          nextRelease: { version: "2.0.0" },
        } as unknown as VerifyReleaseContext,
        pkgContext,
        "latest",
      );
      await expect(
        getDistTagVersion(
          context as unknown as VerifyReleaseContext,
          pkgContext,
          "latest",
        ),
      ).resolves.toBe("2.0.0");
    });

    it("should add channel if there is no version on dist-tag", async () => {
      await addChannel(
        {
          ...context,
          nextRelease: { version: "2.0.0" },
        } as unknown as VerifyReleaseContext,
        pkgContext,
        "next",
      );
      await expect(
        getDistTagVersion(
          context as unknown as VerifyReleaseContext,
          pkgContext,
          "next",
        ),
      ).resolves.toBe("2.0.0");
    });

    it("should add channel if the current version is greater than the version on dist-tag", async () => {
      await addChannel(
        {
          ...context,
          nextRelease: { version: "2.0.0" },
        } as unknown as VerifyReleaseContext,
        pkgContext,
        "next",
      );
      await expect(
        getDistTagVersion(
          context as unknown as VerifyReleaseContext,
          pkgContext,
          "next",
        ),
      ).resolves.toBe("2.0.0");
    });
  });

  it("should add channel with npm 8", async () => {
    const cwd = temporaryDirectory();

    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );

    const pkg = {
      name: `add-channel-helper-npm-8`,
      version: "2.0.0",
      publishConfig: { registry },
      path: cwd,
    };

    await outputJson(path.resolve(pkg.path, "package.json"), pkg);

    const options = {
      cwd,
      preferLocal: true,
    };
    await $(options)`corepack use npm@8`;
    await $(options)`npm install`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

    const ctx = {
      ...context,
      getPluginPackageContext,
      setPluginPackageContext,
      cwd,
      env: process.env,
      repositoryRoot: cwd,
      options: {},
      package: pkg,
      nextRelease: {
        version: pkg.version,
        channels: [null],
      },
    } as unknown as PublishContext;
    await prepare(ctx, {});
    await publish(ctx, {});
    await addChannel(
      {
        ...context,
        package: pkg,
        nextRelease: { version: "2.0.0" },
      } as unknown as VerifyReleaseContext,
      pkgContext!,
      "next",
    );

    await expect(
      getDistTagVersion(
        { context, package: pkg } as unknown as VerifyReleaseContext,
        pkgContext!,
        "next",
      ),
    ).resolves.toBe("2.0.0");
  });

  it.each(["8", "latest"])(
    "should add channel with pnpm %s",
    async (version) => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      const pkg = {
        name: `add-channel-helper-pnpm-${version}`,
        version: "2.0.0",
        publishConfig: { registry },
        path: cwd,
      };

      await outputJson(path.resolve(pkg.path, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`pnpm@${version}`}`;
      await $(options)`pnpm install`;

      let pkgContext: NpmPackageContext;

      const getPluginPackageContext = () => pkgContext;
      const setPluginPackageContext = (context: NpmPackageContext) => {
        pkgContext = context;
      };

      const ctx = {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: pkg,
        nextRelease: {
          version: pkg.version,
          channels: [null],
        },
      } as unknown as PublishContext;
      await prepare(ctx, {});
      await publish(ctx, {});
      await addChannel(
        {
          ...context,
          package: pkg,
          nextRelease: { version: "2.0.0" },
        } as unknown as VerifyReleaseContext,
        pkgContext!,
        "next",
      );

      await expect(
        getDistTagVersion(
          { context, package: pkg } as unknown as VerifyReleaseContext,
          pkgContext!,
          "next",
        ),
      ).resolves.toBe("2.0.0");
    },
  );

  it.each(["latest"])("should add channel with yarn %s", async (version) => {
    const cwd = temporaryDirectory();

    const pkg = {
      name: `add-channel-helper-yarn-${version}`,
      version: "2.0.0",
      publishConfig: { registry },
      path: cwd,
    };

    await outputJson(path.resolve(pkg.path, "package.json"), pkg);

    const options = {
      cwd,
      preferLocal: true,
    };
    await $(options)`corepack use ${`yarn@${version}`}`;
    await $(options)`yarn install`;
    await $(
      options,
    )`yarn config set unsafeHttpWhitelist --json ${`["${registryHost}"]`}`;
    await $(options)`yarn config set npmRegistryServer ${registry}`;
    await $(options)`yarn config set npmAuthToken ${npmToken ?? ""}`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

    const ctx = {
      ...context,
      getPluginPackageContext,
      setPluginPackageContext,
      cwd,
      env: process.env,
      repositoryRoot: cwd,
      options: {},
      package: pkg,
      nextRelease: {
        version: pkg.version,
        channels: [null],
      },
    } as unknown as PublishContext;
    await prepare(ctx, {});
    await publish(ctx, {});
    await addChannel(
      {
        ...context,
        package: pkg,
        nextRelease: { version: "2.0.0" },
      } as unknown as VerifyReleaseContext,
      pkgContext!,
      "next",
    );

    await expect(
      getDistTagVersion(
        { ...context, package: pkg } as unknown as VerifyReleaseContext,
        pkgContext!,
        "next",
      ),
    ).resolves.toBe("2.0.0");
  });
});
