import { inspect } from "node:util";

import { stringify } from "src/utils/stringify";

vi.mock("node:util");

const stringified = "stringified";
const mock = vi.fn().mockReturnValue(stringified);

vi.mocked(inspect).mockImplementation(mock);

describe("stringify", () => {
  it("should stringify value", () => {
    expect(stringify("test")).toBe("test");
    expect(stringify({ test: "test" })).toBe(stringified);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(
      { test: "test" },
      { breakLength: Infinity, depth: 2, maxArrayLength: 5 },
    );
  });
});
