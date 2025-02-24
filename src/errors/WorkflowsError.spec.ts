import { WorkflowsError } from "src/errors/WorkflowsError";

describe("WorkflowsError", () => {
  it("should be defined", () => {
    const errors = [new Error("error"), new Error("another error")];
    const error = new WorkflowsError(errors);

    expect(error.errors).toBe(errors);
  });
});
