import { ERROR_DATA, type ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import type { ServerResponse } from '@repo/zod-schemas/src/api/server-response.schema';

export class ServerError extends Error {
  readonly errorCode: ErrorCode;
  readonly errorFields: Extract<ServerResponse, { success: false }>['errorFields'];
  readonly statusCode: number;

  constructor(
    errorCode: ErrorCode,
    errorFields: Extract<ServerResponse, { success: false }>['errorFields'] = [],
  ) {
    const data = ERROR_DATA[errorCode];
    super(data.message);
    this.name = 'ServerError';
    this.errorCode = errorCode;
    this.statusCode = data.statusCode;
    this.errorFields = errorFields;
  }

  toResponse(): ServerResponse {
    return {
      success: false,
      message: this.message,
      code: this.errorCode,
      errorFields: this.errorFields,
    };
  }
}
