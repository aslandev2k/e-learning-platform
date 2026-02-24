import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import z from 'zod';
import { logger } from '@/lib/client-logger';

const themeZod = z.enum(['light', 'dark', 'system']);
export type Theme = z.infer<typeof themeZod>;
type ResolvedTheme = Exclude<Theme, 'system'>;

export const COLOR_THEMES = [
  'default',
  'golden-hour',
  'desert-rose',
  'midnight-galaxy',
  'modern-minimalist',
  'arctic-frost',
  'forest-canopy',
  'tech-innovation',
  'botanical-garden',
  'ocean-depths',
  'sunset-boulevard',
  'code-nexus',
] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

const COOKIE_THEME_MODE = 'donasky-theme-mode';
const COOKIE_COLOR_THEME = 'donasky-color-theme';
const COLOR_THEME_STYLE_ID = 'color-theme-style';

type ThemeContextType = {
  theme: Theme; // Current theme
  resolvedTheme: ResolvedTheme; // Resolved theme after system detection
  setTheme: (theme: Theme) => void; // Function to set a theme
  toogleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyUI = (currentResoledTheme: ResolvedTheme) => {
  console.log('applyUI theme:', currentResoledTheme);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(currentResoledTheme);
};

const getResolvedTheme = (themeValue: Theme): ResolvedTheme => {
  if (themeValue === 'system') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  } else return themeValue;
};

const applyColorTheme = async (colorTheme: ColorTheme) => {
  const existing = document.getElementById(COLOR_THEME_STYLE_ID);
  if (colorTheme === 'default') {
    existing?.remove();
    return;
  }
  const cssModule = await import(`../css/themes/${colorTheme}.css?raw`);
  const cssText = cssModule.default;
  if (existing) {
    existing.textContent = cssText;
  } else {
    const style = document.createElement('style');
    style.id = COLOR_THEME_STYLE_ID;
    style.textContent = cssText;
    document.head.appendChild(style);
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [cookies, setCookie] = useCookies([COOKIE_THEME_MODE, COOKIE_COLOR_THEME]);
  const theme = themeZod.catch('system').parse(cookies[COOKIE_THEME_MODE]);
  const setTheme = (newTheme: Theme) => setCookie(COOKIE_THEME_MODE, newTheme);

  const colorTheme = (
    COLOR_THEMES.includes(cookies[COOKIE_COLOR_THEME] as ColorTheme)
      ? cookies[COOKIE_COLOR_THEME]
      : 'default'
  ) as ColorTheme;
  const setColorTheme = (newColorTheme: ColorTheme) => setCookie(COOKIE_COLOR_THEME, newColorTheme);

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => getResolvedTheme(theme));
  logger.debug('logger ~ theme-provider.tsx ~ line 58:', { theme, resolvedTheme, colorTheme });

  const toogleTheme = () => {
    if (resolvedTheme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  useEffect(() => {
    if (theme === 'system') {
      const onSystemThemeChange = () => {
        setResolvedTheme(getResolvedTheme('system'));
      };
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', onSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', onSystemThemeChange);
    }

    setResolvedTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyUI(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toogleTheme, colorTheme, setColorTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
