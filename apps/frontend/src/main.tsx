import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import '@/css/main.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import CenteredSpinner from '@/components/CenteredSpinner';
import NotFound from '@/components/page-status/not-found';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/toaster';
import { queryClient } from '@/config/query-client.config';
import { routeTree } from '@/routeTree.gen';

// !IMPORTANT: Route types
// https://tanstack.com/router/latest/docs/framework/react/decisions-on-dx#declaring-the-router-instance-for-type-inference
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFound,
  // defaultPreload: "intent",
  defaultPendingComponent: CenteredSpinner,
  // defaultErrorComponent: ErrorComponent,
  // defaultGcTime: 0,
  // defaultPendingMs: 0,
  // defaultPreloadStaleTime: 0,
});

// apps/frontend/src/routes/__root.tsx
createRoot(document.getElementById('root')!).render(
  <CookiesProvider>
    <ThemeProvider>
      <Toaster position='top-center' expand duration={10000} />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </CookiesProvider>,
);
