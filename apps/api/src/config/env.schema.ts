import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CREDENTIALS_ENCRYPTION_KEY: z.string().min(32)
});

export type AppEnv = z.infer<typeof envSchema>;
