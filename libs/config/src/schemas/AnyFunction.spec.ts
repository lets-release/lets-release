import { AnyFunction } from "src/schemas/AnyFunction";

const fn1 = () => {
  // do something
};
function fn2() {
  // do something
}

describe("AnyFunction", () => {
  it("should validate any function", () => {
    expect(AnyFunction.parse(fn1)).toEqual(fn1);
    expect(AnyFunction.parse(fn2)).toEqual(fn2);
    expect(() => AnyFunction.parse(null)).toThrowError();
  });
});
