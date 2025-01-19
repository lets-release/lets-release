import { $, Options } from "execa";

import { verifyAuth } from "src/utils/git/verifyAuth";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("verifyAuth", () => {
  const repositoryUrl = "https://example.com/repo.git";
  const branch = "main";
  const options: Partial<Options> = {};

  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should verify write access successfully", async () => {
    await expect(
      verifyAuth(repositoryUrl, branch, options),
    ).resolves.toBeUndefined();
  });

  it("should throw an error if not authorized to push", async () => {
    exec.mockRejectedValue(new Error("Not authorized"));

    await expect(verifyAuth(repositoryUrl, branch, options)).rejects.toThrow(
      Error,
    );
  });
});
