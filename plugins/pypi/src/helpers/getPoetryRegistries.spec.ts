import { $ } from "execa";
import normalizeUrl from "normalize-url";
import stripAnsi from "strip-ansi";

import { getPoetryRegistries } from "src/helpers/getPoetryRegistries";

vi.mock("execa");
vi.mock("normalize-url");
vi.mock("strip-ansi");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(normalizeUrl).mockImplementation((url: string) => url);
vi.mocked(stripAnsi).mockImplementation((str: string) => str);

describe("getPoetryRegistries", () => {
  it("should get registries", async () => {
    exec.mockResolvedValueOnce({
      stdout: [
        'unknown = "https://test1.pypi.org/simple"',
        'repositories.test.1.url = "https://test1.pypi.org/simple"',
        'repositories.test.2.url = "https://test2.pypi.org/simple"',
      ],
    });
    exec.mockResolvedValueOnce({ stdout: "https://test1.pypi.org/simple" });
    exec.mockResolvedValueOnce({ stdout: "https://test2.pypi.org/simple" });

    const result = await getPoetryRegistries();

    expect(result).toEqual([
      { name: "test.1", publishUrl: "https://test1.pypi.org/simple" },
      { name: "test.2", publishUrl: "https://test2.pypi.org/simple" },
    ]);
  });
});
