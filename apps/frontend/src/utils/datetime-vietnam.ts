export interface ParsedDate {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function parseDate(date: Date): ParsedDate {
  // Chuyển đổi sang timezone +7 (UTC+7)
  const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return {
    year: vietnamTime.getUTCFullYear(),
    month: vietnamTime.getUTCMonth() + 1, // Month từ 0-11, nên cộng 1
    day: vietnamTime.getUTCDate(),
    hours: vietnamTime.getUTCHours(),
    minutes: vietnamTime.getUTCMinutes(),
    seconds: vietnamTime.getUTCSeconds(),
  };
}

function convertToDate(parsedDate: ParsedDate): Date {
  // Tạo UTC date từ các giá trị
  const utcDate = new Date(
    Date.UTC(
      parsedDate.year,
      parsedDate.month - 1,
      parsedDate.day,
      parsedDate.hours,
      parsedDate.minutes,
      parsedDate.seconds,
    ),
  );

  // Trừ 7 giờ để chuyển về UTC gốc (từ timezone +7)
  const originalDate = new Date(utcDate.getTime() - 7 * 60 * 60 * 1000);

  return originalDate;
}

export function convertDateTimeVietnam(input: { date: Date } | { parsedDate: ParsedDate }): {
  date: Date;
  parsedDate: ParsedDate;
} {
  let date: Date;
  let parsedDate: ParsedDate;

  if ('date' in input) {
    date = input.date;
    parsedDate = parseDate(input.date);
  } else {
    date = convertToDate(input.parsedDate);
    parsedDate = input.parsedDate;
  }

  return { date, parsedDate };
}
