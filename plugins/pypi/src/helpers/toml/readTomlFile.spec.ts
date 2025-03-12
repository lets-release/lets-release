import { readFile } from "node:fs/promises";

import { parse } from "smol-toml";

import { readTomlFile } from "src/helpers/toml/readTomlFile";

vi.mock("node:fs/promises");
vi.mock("smol-toml");

describe("readTomlFile", () => {
  it("should read and parse a TOML file", async () => {
    const mockContent = "key = 'value'";
    const mockParsed = { key: "value" };

    vi.mocked(readFile).mockResolvedValue(mockContent);
    vi.mocked(parse).mockReturnValue(mockParsed);

    const result = await readTomlFile("path/to/file.toml");

    expect(result).toEqual(mockParsed);
    expect(readFile).toHaveBeenCalledWith("path/to/file.toml", "utf8");
    expect(parse).toHaveBeenCalledWith(mockContent);
  });
});
