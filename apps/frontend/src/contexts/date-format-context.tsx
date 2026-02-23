import { createContext, useContext } from 'react';
import { useCookies } from 'react-cookie';

type DateFormat = 'date' | 'datetime' | 'relative';

interface DateFormatContextType {
  format: DateFormat;
  cycleFormat: () => void;
}

const DateFormatContext = createContext<DateFormatContextType | undefined>(undefined);

const DATE_FORMAT_COOKIE_KEY = 'dateDisplayFormat';

export function DateFormatProvider({ children }: { children: React.ReactNode }) {
  const [cookies, setCookie] = useCookies([DATE_FORMAT_COOKIE_KEY]);

  const format = (cookies[DATE_FORMAT_COOKIE_KEY] as DateFormat) || 'date';

  const cycleFormat = () => {
    const nextFormat: Record<DateFormat, DateFormat> = {
      date: 'datetime',
      datetime: 'relative',
      relative: 'date',
    };
    const newFormat = nextFormat[format];
    // Set cookie to expire in 1 year
    setCookie(DATE_FORMAT_COOKIE_KEY, newFormat, { path: '/', maxAge: 31536000 });
  };

  return (
    <DateFormatContext.Provider value={{ format, cycleFormat }}>
      {children}
    </DateFormatContext.Provider>
  );
}

export function useDateFormat() {
  const context = useContext(DateFormatContext);
  if (!context) {
    throw new Error('useDateFormat must be used within DateFormatProvider');
  }
  return context;
}
