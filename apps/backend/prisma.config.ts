import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';
import z from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const output = dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: z.url().parse(output.parsed?.DATABASE_URL),
  },
});
