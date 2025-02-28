import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

dotenv.config();

export type ConfigType = {
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  EMAIL: string;
  EMAIL_PASSWORD: string;
  ACCESS_TOKEN_SECRET_KEY: string;
  ACCESS_TOKEN_EXPIRE_TIME: string;
  REFRESH_TOKEN_SECRET_KEY: string;
  REFRESH_TOKEN_EXPIRE_TIME: string;
};

const requiredVariables = [
  'PORT',
  'DATABASE_URL',
  'REDIS_URL',
  'EMAIL',
  'EMAIL_PASSWORD',
  'ACCESS_TOKEN_SECRET_KEY',
  'ACCESS_TOKEN_EXPIRE_TIME',
  'REFRESH_TOKEN_SECRET_KEY',
  'REFRESH_TOKEN_EXPIRE_TIME',
];

const missingVariables = requiredVariables.filter((variable) => {
  const value = process.env[variable];
  return !value || value.trim() === '';
});

if (missingVariables.length > 0) {
  Logger.error(
    `Missing or empty required environment variables: ${missingVariables.join(', ')}`,
  );
  process.exit(1);
}

export const config: ConfigType = {
  PORT: parseInt(process.env.PORT as string, 10),
  DATABASE_URL: process.env.DATABASE_URL as string,
  REDIS_URL: process.env.REDIS_URL as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  EMAIL: process.env.EMAIL as string,
  ACCESS_TOKEN_SECRET_KEY: process.env.ACCESS_TOKEN_SECRET_KEY as string,
  ACCESS_TOKEN_EXPIRE_TIME: process.env.ACCESS_TOKEN_EXPIRE_TIME as string,
  REFRESH_TOKEN_SECRET_KEY: process.env.REFRESH_TOKEN_SECRET_KEY as string,
  REFRESH_TOKEN_EXPIRE_TIME: process.env.REFRESH_TOKEN_EXPIRE_TIME as string,
};
