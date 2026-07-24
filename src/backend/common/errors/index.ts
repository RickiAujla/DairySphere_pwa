export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown> | unknown[];

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown> | unknown[]
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: Record<string, unknown> | unknown[]) {
    super(message, 401, 'UNAUTHENTICATED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', details?: Record<string, unknown> | unknown[]) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Requested resource not found', details?: Record<string, unknown> | unknown[]) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: Record<string, unknown> | unknown[]) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class DomainValidationError extends AppError {
  constructor(message: string = 'Domain validation failed', details?: Record<string, unknown> | unknown[]) {
    super(message, 422, 'DOMAIN_VALIDATION_ERROR', details);
  }
}
