import { CiEnv } from "env-ci";
import { $ } from "execa";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
import { exchangeTrustedPublisherToken } from "src/helpers/exchangeTrustedPublisherToken";
import { getTrustedPublisherIdToken } from "src/helpers/getTrustedPublisherIdToken";
import { verifyAuth } from "src/helpers/verifyAuth";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("execa");
vi.mock("src/helpers/getTrustedPublisherIdToken");
vi.mock("src/helpers/exchangeTrustedPublisherToken");

const mockGetTrustedPublisherIdToken = vi.mocked(getTrustedPublisherIdToken);
const mockExchangeTrustedPublisherToken = vi.mocked(
  exchangeTrustedPublisherToken,
);

const scope = "@scope";
const registry = "https://test.org";
const pkg = {
  path: "/root/pkg",
  name: "test-package",
  uniqueName: "test-package",
};
const logger = { warn: vi.fn() };

const baseContext = {
  ciEnv: { name: "GitHub Actions" } as unknown as CiEnv,
  env: {},
  logger,
  package: pkg,
} as unknown as Pick<
  AnalyzeCommitsContext,
  "ciEnv" | "env" | "logger" | "package"
>;

describe("verifyAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("with trusted publisher authentication", () => {
    it("should return early when trusted publisher token exchange succeeds", async () => {
      mockGetTrustedPublisherIdToken.mockResolvedValue("id-token");
      mockExchangeTrustedPublisherToken.mockResolvedValue("npm-token");

      await verifyAuth(baseContext, {
        pm: {
          name: NpmPackageManagerName.npm,
          version: "1.0.0",
          root: "/root",
        },
        registry,
      } as NpmPackageContext);

      expect(mockGetTrustedPublisherIdToken).toHaveBeenCalledWith(
        { ciEnv: baseContext.ciEnv, logger, package: pkg },
        { registry },
      );
      expect(mockExchangeTrustedPublisherToken).toHaveBeenCalledWith(
        { logger, package: pkg },
        { registry },
        "id-token",
      );
      expect(vi.mocked($)).not.toHaveBeenCalled();
    });

    it("should fallback to traditional auth when no trusted publisher token", async () => {
      mockGetTrustedPublisherIdToken.mockResolvedValue(undefined);

      const mockExecFunction = vi.fn().mockResolvedValue(undefined);
      vi.mocked($).mockReturnValue(mockExecFunction as never);

      await verifyAuth(baseContext, {
        pm: {
          name: NpmPackageManagerName.npm,
          version: "1.0.0",
          root: "/root",
        },
        registry,
      } as NpmPackageContext);

      expect(mockGetTrustedPublisherIdToken).toHaveBeenCalled();
      expect(mockExchangeTrustedPublisherToken).not.toHaveBeenCalled();
      expect(vi.mocked($)).toHaveBeenCalledWith({
        cwd: "/root",
        env: {},
        preferLocal: true,
      });
    });

    it("should fallback to traditional auth when token exchange fails", async () => {
      mockGetTrustedPublisherIdToken.mockResolvedValue("id-token");
      mockExchangeTrustedPublisherToken.mockResolvedValue(undefined);

      const mockExecFunction = vi.fn().mockResolvedValue(undefined);
      vi.mocked($).mockReturnValue(mockExecFunction as never);

      await verifyAuth(baseContext, {
        pm: {
          name: NpmPackageManagerName.npm,
          version: "1.0.0",
          root: "/root",
        },
        registry,
      } as NpmPackageContext);

      expect(mockGetTrustedPublisherIdToken).toHaveBeenCalled();
      expect(mockExchangeTrustedPublisherToken).toHaveBeenCalled();
      expect(vi.mocked($)).toHaveBeenCalled();
    });
  });

  describe("with traditional authentication", () => {
    beforeEach(() => {
      mockGetTrustedPublisherIdToken.mockResolvedValue(undefined);
    });

    it("should throw AggregateError with NeedAuthError when npm command fails", async () => {
      const originalError = new Error("Authentication failed");
      const mockExecFunction = vi.fn().mockRejectedValue(originalError);
      vi.mocked($).mockReturnValue(mockExecFunction as never);

      await expect(
        verifyAuth(baseContext, {
          pm: {
            name: NpmPackageManagerName.npm,
            version: "1.0.0",
            root: "/root",
          },
          registry,
        } as NpmPackageContext),
      ).rejects.toThrow(AggregateError);

      expect(vi.mocked($)).toHaveBeenCalledWith({
        cwd: "/root",
        env: {},
        preferLocal: true,
      });
    });

    it("should verify with npm by default", async () => {
      const mockExecFunction = vi.fn().mockResolvedValue(undefined);
      vi.mocked($).mockReturnValue(mockExecFunction as never);

      await verifyAuth(baseContext, {
        pm: {
          name: NpmPackageManagerName.npm,
          version: "1.0.0",
          root: "/root",
        },
        registry,
      } as NpmPackageContext);

      expect(vi.mocked($)).toHaveBeenCalledWith({
        cwd: "/root",
        env: {},
        preferLocal: true,
      });
    });

    it("should verify with pnpm and fallback on first command failure", async () => {
      const firstError = new Error("First command failed");

      const mockFailFunction = vi.fn().mockRejectedValue(firstError);
      const mockSuccessFunction = vi.fn().mockResolvedValue(undefined);
      vi.mocked($)
        .mockReturnValueOnce(mockFailFunction as never)
        .mockReturnValueOnce(mockSuccessFunction as never);

      await verifyAuth(baseContext, {
        pm: {
          name: NpmPackageManagerName.pnpm,
          version: "9.0.0",
          root: "/root",
        },
        registry,
      } as NpmPackageContext);

      expect(vi.mocked($)).toHaveBeenCalledTimes(2);
      // First call with pkg.path as cwd
      expect(vi.mocked($)).toHaveBeenNthCalledWith(1, {
        cwd: "/root/pkg",
        env: {},
        preferLocal: true,
      });
      // Second call with pm.root as cwd
      expect(vi.mocked($)).toHaveBeenNthCalledWith(2, {
        cwd: "/root",
        env: {},
        preferLocal: true,
      });
    });

    it("should throw AggregateError when both pnpm commands fail", async () => {
      const error1 = new Error("First pnpm command failed");
      const error2 = new Error("Second pnpm command failed");

      const mockFailFunction1 = vi.fn().mockRejectedValue(error1);
      const mockFailFunction2 = vi.fn().mockRejectedValue(error2);
      vi.mocked($)
        .mockReturnValueOnce(mockFailFunction1 as never)
        .mockReturnValueOnce(mockFailFunction2 as never);

      await expect(
        verifyAuth(baseContext, {
          pm: {
            name: NpmPackageManagerName.pnpm,
            version: "9.0.0",
            root: "/root",
          },
          registry,
        } as NpmPackageContext),
      ).rejects.toThrow(AggregateError);

      expect(vi.mocked($)).toHaveBeenCalledTimes(2);
    });

    it("should verify with yarn without scope", async () => {
      const mockExecFunction = vi.fn().mockResolvedValue(undefined);
      vi.mocked($).mockReturnValue(mockExecFunction as never);

      await verifyAuth(baseContext, {
        pm: {
          name: NpmPackageManagerName.yarn,
          version: "4.0.0",
          root: "/root",
        },
        registry,
      } as NpmPackageContext);

      expect(vi.mocked($)).toHaveBeenCalledWith({
        cwd: "/root",
        env: {},
        preferLocal: true,
      });
    });

    it("should verify with yarn with scope", async () => {
      const mockExecFunction = vi.fn().mockResolvedValue(undefined);
      vi.mocked($).mockReturnValue(mockExecFunction as never);

      await verifyAuth(baseContext, {
        pm: {
          name: NpmPackageManagerName.yarn,
          version: "4.0.0",
          root: "/root",
        },
        scope,
        registry,
      } as NpmPackageContext);

      expect(vi.mocked($)).toHaveBeenCalledWith({
        cwd: "/root",
        env: {},
        preferLocal: true,
      });
    });

    it("should throw AggregateError when yarn command fails", async () => {
      const yarnError = new Error("Yarn authentication failed");
      const mockFailFunction = vi.fn().mockRejectedValue(yarnError);
      vi.mocked($).mockReturnValue(mockFailFunction as never);

      await expect(
        verifyAuth(baseContext, {
          pm: {
            name: NpmPackageManagerName.yarn,
            version: "4.0.0",
            root: "/root",
          },
          registry,
        } as NpmPackageContext),
      ).rejects.toThrow(AggregateError);
    });

    it("should handle unknown package manager as npm", async () => {
      const mockExecFunction = vi.fn().mockResolvedValue(undefined);
      vi.mocked($).mockReturnValue(mockExecFunction as never);

      await verifyAuth(baseContext, {
        pm: {
          name: "unknown-pm" as NpmPackageManagerName,
          version: "1.0.0",
          root: "/root",
        },
        registry,
      } as NpmPackageContext);

      expect(vi.mocked($)).toHaveBeenCalledWith({
        cwd: "/root",
        env: {},
        preferLocal: true,
      });
    });
  });
});
