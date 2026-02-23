import { addSeconds } from 'date-fns';
export type TimeStringValue = `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`;

function getTimeUnit(value: TimeStringValue): string {
  const match = value.match(/[a-z]+$/);
  if (!match) {
    throw new Error(`Invalid time string: ${value}`);
  }
  return match[0];
}

const parseTimeToSeconds = (time: TimeStringValue): number => {
  const unit = getTimeUnit(time);
  const value = Number.parseInt(time);
  if (Number.isNaN(value)) throw new Error(`Invalid numeric value in time string: ${time}`);

  switch (unit) {
    case 'ms':
      return Math.round(value / 1000);
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Invalid time format: ${time}`);
  }
};

export const parseTime = {
  toMilliseconds: (time: TimeStringValue) => parseTimeToSeconds(time) * 1000,
  toSeconds: (time: TimeStringValue) => parseTimeToSeconds(time),
  toMinutes: (time: TimeStringValue) => Math.round(parseTimeToSeconds(time) / 60),
  toHours: (time: TimeStringValue) => Math.round(parseTimeToSeconds(time) / (60 * 60)),
  toDays: (time: TimeStringValue) => Math.round(parseTimeToSeconds(time) / (60 * 60 * 24)),
};

export const getDeadline = (expiresIn: TimeStringValue): Date => {
  const seconds = parseTimeToSeconds(expiresIn);
  return addSeconds(new Date(), seconds);
};

export const calculateTimeLeft = (targetTime: Date) => {
  const now = Date.now();
  const target = targetTime.getTime();
  const difference = Math.max(target - now, 0);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  const messages = [];
  if (days > 0) messages.push(`${days}d`);
  if (hours > 0) messages.push(`${hours}h`);
  if (minutes > 0) messages.push(`${minutes}m`);
  messages.push(`${seconds}s`);
  return {
    days,
    hours,
    minutes,
    seconds,
    message: messages.join(' '),
  };
};

export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const isValidTimezoneIANAString = (timeZone: string): boolean => {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch (_error) {
    return false;
  }
};
