import { GenerateNotesResult } from "src/schemas/GenerateNotesResult";

describe("GenerateNotesResult", () => {
  it("should validate generate notes result", () => {
    expect(GenerateNotesResult.parse("result")).toEqual("result");
  });
});
