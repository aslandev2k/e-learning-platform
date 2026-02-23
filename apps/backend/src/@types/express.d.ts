import type { ServerResponse } from '@repo/zod-schemas/src/api/server-response.schema';

declare global {
  namespace Express {
    interface Response {
      json: <T = unknown>(body: ServerResponse<T>) => this;
    }
  }
}
