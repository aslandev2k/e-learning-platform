import { Link } from '@tanstack/react-router';
import { ModeToggle } from '@/components/mode-toggle';
import { sidebarMenuButtonVariants } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

function AppHeader() {
  return (
    <header className='w-screen px-6 bg-sidebar text-sidebar-foreground transition-all border-b h-12 flex flex-row justify-between items-center'>
      <Link
        className={cn(sidebarMenuButtonVariants(), 'inline-flex items-center gap-2 w-fit')}
        to='/'
      >
        <img src='/app-logo.svg' alt='logo' className='size-8' />
        <p>Hệ thống luyện tập lập trình</p>
      </Link>
      <div className='inline-flex items-center'>
        <ModeToggle />
      </div>
    </header>
  );
}

export default AppHeader;
