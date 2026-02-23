export const ELEMENT_IDS = {
  root: 'standalone-core',
  header: 'app-header',
  body: 'app-body',
  sideBar: 'app-sidebar',
} as const;
export const PROPERTY_NAMES = {
  headerHeight: '--app-header-h',
  sidebarWidth: '--app-sidebar-w',
};

export const STRIPE_DATE_FORMAT = 'd MMM yyyy';

type ElementKey = keyof typeof ELEMENT_IDS;

export const getElement = (key: ElementKey) => document.getElementById(ELEMENT_IDS[key]);
