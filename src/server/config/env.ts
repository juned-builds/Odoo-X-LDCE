import * as dotenv from 'dotenv';
dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  clientOrigin: string | string[];
  db: {
    host?: string;
    database?: string;
    user?: string;
    hasPassword?: boolean;
  };
}

const parseClientOrigin = (originValue?: string): string | string[] => {
  if (!originValue || originValue.trim() === '' || originValue === '*') {
    return '*';
  }
  if (originValue.includes(',')) {
    return originValue.split(',').map((o) => o.trim());
  }
  return originValue.trim();
};

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientOrigin: parseClientOrigin(process.env.CLIENT_ORIGIN),
  db: {
    host: process.env.SQL_HOST,
    database: process.env.SQL_DB_NAME,
    user: process.env.SQL_USER,
    hasPassword: Boolean(process.env.SQL_PASSWORD),
  },
};
