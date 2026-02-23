import z from 'zod';

export const getEnvMode = () =>
  z.enum(['development', 'staging', 'production']).catch('development').parse(process.env.NODE_ENV);
