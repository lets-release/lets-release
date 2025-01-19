export abstract class LetsReleaseError extends Error {
  abstract readonly message: string;
  abstract readonly details?: string;

  constructor() {
    super();
    Error.captureStackTrace(this, this.constructor);
  }
}
