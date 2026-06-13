import type { AppContext } from './types.ts'
import { logger, serializeError } from './logger.ts'

type ErrorStatusCode = 400 | 401 | 403 | 404 | 409 | 422 | 500

export class AppError extends Error {
  readonly statusCode: ErrorStatusCode
  readonly code: string
  readonly details?: unknown

  constructor(message: string, statusCode: ErrorStatusCode, code: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

// Handles a thrown error inside a route handler's catch block, logging it
// with request context and returning a consistently-shaped JSON response.
export function handleError(c: AppContext, error: unknown, fallbackMessage: string) {
  const requestId = c.get('requestId')
  const context = {
    requestId,
    method: c.req.method,
    path: c.req.path,
  }

  if (error instanceof AppError) {
    logger.warn(error.message, {
      ...context,
      code: error.code,
      statusCode: error.statusCode,
      ...(error.details ? { details: error.details } : {}),
    })
    return c.json({ error: error.message, code: error.code, requestId }, error.statusCode)
  }

  if (error instanceof SyntaxError) {
    logger.warn('Invalid JSON in request body', { ...context, error: serializeError(error) })
    return c.json({ error: 'Invalid JSON in request body', code: 'INVALID_JSON', requestId }, 400)
  }

  logger.error(fallbackMessage, { ...context, error: serializeError(error) })
  return c.json({ error: fallbackMessage, code: 'INTERNAL_ERROR', requestId }, 500)
}
