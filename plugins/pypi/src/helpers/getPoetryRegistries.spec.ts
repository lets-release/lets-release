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
  beforeEach(() => {
    exec.mockReset();
  });

  it("should get registries from url format", async () => {
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

    expect(exec).toHaveBeenCalledTimes(3);
    expect(result).toEqual([
      { name: "test.1", publishUrl: "https://test1.pypi.org/simple" },
      { name: "test.2", publishUrl: "https://test2.pypi.org/simple" },
    ]);
  });

  it("should get registries from JSON object format", async () => {
    exec.mockResolvedValueOnce({
      stdout: [
        'unknown = "https://test1.pypi.org/simple"',
        'repositories.a = {"url": "https://test1.pypi.org/simple"}',
        'repositories.c.d = {"url": "https://test2.pypi.org/simple"}',
      ],
    });

    const result = await getPoetryRegistries();

    expect(exec).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { name: "a", publishUrl: "https://test1.pypi.org/simple" },
      { name: "c.d", publishUrl: "https://test2.pypi.org/simple" },
    ]);
  });

  it("should get registries from mixed formats", async () => {
    exec.mockResolvedValueOnce({
      stdout: [
        'repositories.a.url = "https://test1.pypi.org/simple"',
        'repositories.b = {"url": "https://test2.pypi.org/simple"}',
        'repositories.c.d = {"url": "https://test3.pypi.org/simple"}',
      ],
    });
    exec.mockResolvedValueOnce({ stdout: "https://test1.pypi.org/simple" });

    const result = await getPoetryRegistries();

    expect(exec).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { name: "a", publishUrl: "https://test1.pypi.org/simple" },
      { name: "b", publishUrl: "https://test2.pypi.org/simple" },
      { name: "c.d", publishUrl: "https://test3.pypi.org/simple" },
    ]);
  });

  it("should skip non-JSON non-url repository entries", async () => {
    exec.mockResolvedValueOnce({
      stdout: [
        'repositories.test.name = "my-repo"',
        'repositories.a = {"url": "https://test1.pypi.org/simple"}',
      ],
    });

    const result = await getPoetryRegistries();

    expect(exec).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { name: "a", publishUrl: "https://test1.pypi.org/simple" },
    ]);
  });
});
