import { WritableStream } from "node:stream/web";

import { $ } from "execa";

import { VerifyConditionsContext } from "@lets-release/config";

import { verifyAuth } from "src/helpers/verifyAuth";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("execa");
vi.mock("src/helpers/getRegistry");

const context = {
  stdout: new WritableStream(),
  stderr: new WritableStream(),
} as unknown as VerifyConditionsContext;
const registry = "https://test.org";

describe("verifyAuth", () => {
  beforeEach(() => {
    vi.mocked($).mockReset();
  });

  it("should throw error if command fails", async () => {
    vi.mocked($).mockReturnValue(
      vi.fn().mockRejectedValue(new Error("Test")) as never,
    );

    await expect(
      verifyAuth(context, {
        pm: { name: "npm", version: "*", root: "./" },
        registry,
      } as NpmPackageContext),
    ).rejects.toThrow(AggregateError);
  });

  it("should verify with pnpm", async () => {
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

    await expect(
      verifyAuth(context, {
        pm: {
          name: "pnpm",
          version: "9.0.0",
          root: "./",
        },
        registry,
      } as NpmPackageContext),
    ).resolves.toBe(undefined);
  });

  it("should verify with yarn", async () => {
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

    await expect(
      verifyAuth(context, {
        pm: {
          name: "yarn",
          version: "4.0.0",
          root: "./",
        },
        registry,
      } as NpmPackageContext),
    ).resolves.toBe(undefined);
  });

  it("should verify scoped registry with yarn", async () => {
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

    await expect(
      verifyAuth(context, {
        pm: {
          name: "yarn",
          version: "4.0.0",
          root: "./",
        },
        scope: "@scope",
        registry,
      } as NpmPackageContext),
    ).resolves.toBe(undefined);
  });

  it("should verify with npm", async () => {
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

    await expect(
      verifyAuth(context, {
        pm: {
          name: "npm",
          version: "4.0.0",
          root: "./",
        },
        registry,
      } as NpmPackageContext),
    ).resolves.toBe(undefined);
  });
});
