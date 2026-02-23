import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';
import { getEnvMode } from '@/utils/env-mode';
import { logger } from '@/utils/logger';

const envSchema = z.object({
  mode: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string('Missing DATABASE_URL'),
  JWT_SECRET: z.string('Missing JWT_SECRET').default('randomStr'),
  PORT: z
    .union([z.string().transform(Number), z.number().default(8080)])
    .pipe(z.number().int().positive()),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
});

const getEnvFromFile = (): z.infer<typeof envSchema> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(`${__dirname}/../../../.env`);
  const envFileParsedResult = dotenv.config({ path: envPath });
  if (envFileParsedResult.error) {
    logger.error(envFileParsedResult.error.message);
    process.exit(1);
  }

  const mode = getEnvMode();

  const envFileData = envFileParsedResult.parsed!;

  const input = {
    mode,
    DATABASE_URL: envFileData.DATABASE_URL,
    JWT_SECRET: envFileData.JWT_SECRET,
    PORT: envFileData.PORT,
    REDIS_HOST: envFileData.REDIS_HOST,
    REDIS_PORT: envFileData.REDIS_PORT,
  };
  const checkEnv = envSchema.safeParse(input);
  if (!checkEnv.success) {
    logger.error('Parse env error!', {
      mode,
      errors: checkEnv.error.issues,
    });
    process.exit(1);
  }
  return checkEnv.data;
};

export const envData = getEnvFromFile();
