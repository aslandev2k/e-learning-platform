import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import type { RouteId } from '@/@type/tanstack-route';
import { buttonVariants } from '@/components/ui/button';
import { PAGE_NAME } from '@/hooks/use-page-name';
import { cn } from '@/lib/utils';
import AppHeader from '@/routes/-layout/-components/app-header';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  loader: () => {
    if (import.meta.env.PROD) throw redirect({ to: '/auth/sign-in' });
  },
});

const availablePage = new Set<RouteId>([
  // Auth
  '/auth/sign-in',
  '/auth/sign-out',
  '/auth/change-password',
  // Error Pages
  '/app/error/',
  '/app/error/403',
  '/app/error/404',
  '/app/error/gone',
  '/error/503',
]);

const skipPages = new Set<RouteId>(['/auth', '/', '/app']);
function RouteComponent() {
  const router = useRouter();
  const routes = Object.values(router.routesById)
    .map((route) => route.fullPath)
    .filter((path: RouteId) => path !== '/' && !skipPages.has(path))
    .sort();

  return (
    <>
      <AppHeader />
      <div className='mx-auto w-220 p-6'>
        <h1 className='mb-4 text-lg font-semibold'>Danh sách trang</h1>

        <ul className='space-y-2'>
          {routes.map((path) => {
            const available = availablePage.has(path);
            return (
              <Link
                to={path}
                key={path}
                className={cn(
                  buttonVariants({ variant: 'link' }),
                  'font-mono text-md',
                  'rounded-md border px-3 py-2 flex justify-between hover:ring-1 duration-25',
                  available ? 'text-success' : 'text-warning',
                )}
              >
                <div className='inline-flex'>
                  <span className='w-100'>{PAGE_NAME[path as RouteId]}</span>
                  <p>{path}</p>
                </div>
                {available && <Check className='stroke-success' />}
              </Link>
            );
          })}
        </ul>
      </div>
    </>
  );
}
