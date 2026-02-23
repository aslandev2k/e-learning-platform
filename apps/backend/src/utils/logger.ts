import { APP_CONFIG } from '@repo/shared/src/app-config';
import winston from 'winston';
import { getEnvMode } from '@/utils/env-mode';

export const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
} as const;
export type LogLevel = keyof typeof LEVELS;
export type Logger = Pick<winston.Logger, LogLevel | 'level'>;

const isLocal = getEnvMode() === 'development';

const MAX_LENGTH = isLocal ? 10000 : 1000;

const { combine, timestamp, printf, colorize } = winston.format;

const convertToString = (item: any) => {
  try {
    return JSON.stringify(item, null, isLocal ? 2 : undefined)?.slice(0, MAX_LENGTH);
  } catch (_error) {}
  return String(item.message || item)?.slice(0, MAX_LENGTH);
};

const format = combine(
  timestamp({
    format: () => {
      const vietnamTime = new Date(Date.now() + 7 * 60 * 60 * 1000);
      const formatted = vietnamTime.toISOString().replace('T', ' ').substring(0, 19);
      return `${formatted} UTC+7`;
    },
  }),
  printf(({ level, message, ...meta }) => {
    const splatSymbol = Symbol.for('splat');
    const metaSplat = (meta[splatSymbol] || []) as unknown[];
    const prefix = isLocal ? '' : `[${APP_CONFIG.ID}-${level.toUpperCase()}]:`;
    try {
      return `${prefix} ${message} ${metaSplat?.map((item) => convertToString(item))}`;
    } catch (_error) {
      return `${prefix} ${message}`;
    }
  }),
  colorize({
    all: isLocal,
    colors: {
      error: 'red',
      warn: 'yellow',
      verbose: 'cyan',
      info: 'green',
      http: 'grey dim',
      debug: 'grey dim',
    },
  }),
);

const productionLogger = winston.createLogger({
  level: 'info',
  format,
  levels: LEVELS,
  transports: [new winston.transports.Console({ level: 'info' })],
});

const localLogger = winston.createLogger({
  level: 'silly',
  format,
  levels: LEVELS,
  transports: [new winston.transports.Console()],
});

export const logger: Logger = isLocal ? localLogger : productionLogger;
