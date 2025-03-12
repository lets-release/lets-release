import { inject } from "vitest";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { NeedAuthError } from "src/errors/NeedAuthError";
import { verifyAuth } from "src/helpers/verifyAuth";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

const pypiPublishUrl = inject("pypiPublishUrl");
const pypiToken = inject("pypiToken");
const pypiUsername = inject("pypiUsername");
const pypiPassword = inject("pypiPassword");

const context = {
  env: {},
  package: {},
} as AnalyzeCommitsContext;
const pkgContext = {
  pm: {
    name: PyPIPackageManagerName.uv,
    root: "/root",
  },
  pkg: {},
  registry: {
    publishUrl: pypiPublishUrl,
  },
} as PyPIPackageContext;

describe("verifyAuth", () => {
  it("should throw an error if no token or password is provided", async () => {
    await expect(verifyAuth(context, pkgContext)).rejects.toThrow(
      NeedAuthError,
    );
  });

  it("should verify auth with token", async () => {
    await expect(
      verifyAuth(
        {
          ...context,
          env: {
            UV_PUBLISH_TOKEN: pypiToken,
          },
        },
        pkgContext,
      ),
    ).resolves.toBeUndefined();
  });

  it("should verify auth with username and password", async () => {
    await expect(
      verifyAuth(
        {
          ...context,
          env: {
            UV_PUBLISH_USERNAME: pypiUsername,
            UV_PUBLISH_PASSWORD: pypiPassword,
          },
        },
        pkgContext,
      ),
    ).resolves.toBeUndefined();
  });

  it("should throw an error if failed", async () => {
    await expect(
      verifyAuth(
        {
          ...context,
          env: {
            UV_PUBLISH_TOKEN: "invalid-token",
          },
        },
        pkgContext,
      ),
    ).rejects.toThrow(NeedAuthError);
  });
});
