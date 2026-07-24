import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  DATABASE_URL?: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  NODE_ENV: string;
  PORT: number;
  APP_URL?: string;
}

function getEnvConfig(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = 3000;
  
  const missingVars: string[] = [];

  if (!process.env.DATABASE_URL) {
    missingVars.push('DATABASE_URL');
  }
  if (!process.env.JWT_SECRET) {
    missingVars.push('JWT_SECRET');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    missingVars.push('JWT_REFRESH_SECRET');
  }

  if (missingVars.length > 0) {
    console.warn(
      `[ENV WARNING] Missing environment variables: ${missingVars.join(', ')}.`
    );
    if (nodeEnv === 'production') {
      console.error('[ENV ERROR] Critical environment variables are missing in production!');
    } else {
      console.warn('[ENV WARNING] Falling back to development defaults for missing auth keys.');
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_fallback_key_32chars_min',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_fallback_key_32chars',
    NODE_ENV: nodeEnv,
    PORT: port,
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
  };
}

export const env = getEnvConfig();
