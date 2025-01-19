import { NormalizedReadResult, readPackageUp } from "read-package-up";

import { getRepoUrl } from "src/utils/getRepoUrl";

vi.mock("read-package-up");

const url = "https://github.com/lets-release/lets-release";

describe("getRepoUrl", () => {
  beforeEach(() => {
    vi.mocked(readPackageUp).mockReset();
  });

  it("should return undefined if package.json not found", async () => {
    vi.mocked(readPackageUp).mockResolvedValue(undefined);

    await expect(getRepoUrl({})).resolves.toBeUndefined();
  });

  it("should return url from 'repository' field", async () => {
    vi.mocked(readPackageUp).mockResolvedValue({
      packageJson: { repository: url },
    } as NormalizedReadResult);

    await expect(getRepoUrl({})).resolves.toBe(url);
  });

  it("should return url from 'repository.url' field", async () => {
    vi.mocked(readPackageUp).mockResolvedValue({
      packageJson: { repository: { url } },
    } as NormalizedReadResult);

    await expect(getRepoUrl({})).resolves.toBe(url);
  });
});
