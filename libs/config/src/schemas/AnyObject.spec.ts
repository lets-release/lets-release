import { AnyObject } from "src/schemas/AnyObject";

describe("AnyObject", () => {
  const obj = {
    a: 1,
    b: "hello world",
  };

  it("should validate any object", () => {
    expect(AnyObject.parse(obj)).toEqual(obj);
  });
});
