import { Marked } from "marked";

import { parseMarkdown } from "src/utils/parseMarkdown";

vi.mock("marked", () => {
  class Marked {
    parse() {
      // do nothing
    }
  }

  return { Marked };
});

const parsedContent = "parsed content";
const parse = vi
  .spyOn(Marked.prototype, "parse")
  .mockResolvedValue(parsedContent);

describe("parseMarkdown", () => {
  it("should parse markdown", async () => {
    await expect(parseMarkdown("content")).resolves.toBe(parsedContent);
    expect(parse).toHaveBeenCalledWith("content");
  });
});
