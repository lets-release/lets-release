import { getMaskingHandler } from "src/utils/getMaskingHandler";
import { maskObject } from "src/utils/maskObject";

vi.mock("src/utils/getMaskingHandler");

const handler = vi.fn().mockImplementation((value) => `masked: ${value}`);

vi.mocked(getMaskingHandler).mockReturnValue(handler);

describe("maskObject", () => {
  it("should mask object", () => {
    expect(
      maskObject(
        {},
        {
          a: "a",
          b: "b",
          c: {
            name: "name",
          },
          d: null,
        },
      ),
    ).toEqual({
      a: "masked: a",
      b: "masked: b",
      c: {
        name: "masked: name",
      },
      d: null,
    });
    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenNthCalledWith(1, "a");
    expect(handler).toHaveBeenNthCalledWith(2, "b");
    expect(handler).toHaveBeenNthCalledWith(3, "name");
  });
});
