export class AppError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function formatError(err: unknown): { code: string; message: string; details?: unknown } {
  if (err instanceof AppError) {
    return {
      code: err.code,
      message: err.message,
      details: err.details,
    };
  }

  // Handle Prisma Known Request Errors
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: Record<string, unknown>; message?: string };
    if (prismaErr.code === 'P2002') {
      const target = (prismaErr.meta?.target as string[])?.join(', ') || 'field';
      return {
        code: 'DUPLICATE_CODE',
        message: `A record with this ${target} already exists.`,
        details: prismaErr.meta,
      };
    }
    if (prismaErr.code === 'P2003') {
      return {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Cannot perform this action because related records depend on it.',
        details: prismaErr.meta,
      };
    }
    if (prismaErr.code === 'P2025') {
      return {
        code: 'RECORD_NOT_FOUND',
        message: 'The requested record was not found or has been removed.',
        details: prismaErr.meta,
      };
    }
  }

  if (err instanceof Error) {
    if (err.message.includes('ECONNREFUSED') || err.message.includes('connect to database') || err.message.includes('Can\'t reach database server')) {
      return {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Cannot connect to the PostgreSQL database. Please verify your connection string and database status.',
      };
    }

    return {
      code: 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred.',
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred.',
  };
}
