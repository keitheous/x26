export abstract class AppError extends Error {
  abstract readonly status: number;

  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  readonly status = 404;

  constructor(message: string, code = 'NOT_FOUND') {
    super(message, code);
  }
}

export class ConflictError extends AppError {
  readonly status = 409;

  constructor(message: string, code = 'CONFLICT') {
    super(message, code);
  }
}

export class ForbiddenError extends AppError {
  readonly status = 403;

  constructor(message: string, code = 'FORBIDDEN') {
    super(message, code);
  }
}

export class ValidationError extends AppError {
  readonly status = 400;

  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code);
  }
}
