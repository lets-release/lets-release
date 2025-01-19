export class WorkflowsError extends Error {
  constructor(readonly errors: unknown[]) {
    super();
  }
}
