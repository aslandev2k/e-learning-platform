import cors from 'cors';
import { envData } from '@/env-data';

export const corsConfig = cors({
  origin: (origin, callback) => {
    if (
      envData.mode === 'development' || // local
      !origin // core (same-origin)
    )
      return callback(null, true);

    return callback(
      // Preflight -> CORS error
      new Error('CORS error', {
        cause: { origin, mode: envData.mode },
      }),
      false,
    );
  },
  credentials: true,
});
