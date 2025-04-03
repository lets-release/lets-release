import path from "node:path";
import { pathToFileURL } from "node:url";

import resolveFrom from "resolve-from";

import { loadModule } from "src/helpers/loadModule";

vi.mock("resolve-from");

const file = path.resolve(process.cwd(), "preset.js");
const fileUrl = pathToFileURL(file).toString();
const silent = vi.fn();
const loader = vi.fn();

vi.mocked(resolveFrom).mockReturnValue(file);
// eslint-disable-next-line @typescript-eslint/unbound-method
vi.mocked(resolveFrom.silent).mockImplementation(silent);

const dir = "dir";
const name = "package";

describe("loadModule", () => {
  beforeEach(() => {
    silent.mockClear();
    loader.mockClear();
    vi.mocked(resolveFrom).mockClear();
  });

  it("should return default export", async () => {
    vi.doMock(fileUrl, () => ({ default: loader }));

    await expect(loadModule(name, [dir])).resolves.toEqual(loader);
    expect(silent).toHaveBeenCalledWith(dir, name);
    expect(resolveFrom).toHaveBeenCalledWith(process.cwd(), name);
  });

  it("should return named export", async () => {
    vi.doMock(fileUrl, () => ({
      default: undefined,
      named: loader,
    }));

    await expect(loadModule(name, [dir])).resolves.toEqual({
      named: loader,
    });
    expect(silent).toHaveBeenCalledWith(dir, name);
    expect(resolveFrom).toHaveBeenCalledWith(process.cwd(), name);
  });
});
