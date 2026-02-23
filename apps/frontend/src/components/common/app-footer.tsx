import { toast } from 'sonner';
import Typography from '@/components/typography';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

const EMAIL = 'admin@donasky.com';

interface AppFooterProps {
  visible?: boolean;
}

/**
 * Copyright footer component.
 * When `visible` is false, renders a hidden footer for copyright marking purposes.
 */
export default function AppFooter({ visible = true }: AppFooterProps) {
  const [copy] = useCopyToClipboard();

  return (
    <footer
      className={
        visible
          ? 'fixed bottom-0 w-full py-3 text-center text-xs text-muted-foreground bg-background'
          : 'sr-only'
      }
    >
      <p>
        &copy; 2026 DonaSky team &middot;{' '}
        <button
          type='button'
          className='hover:text-foreground transition-colors cursor-pointer'
          onClick={() => {
            copy(EMAIL).then((res) => {
              if (res)
                toast.success(
                  <span>
                    Đã sao chép email: <Typography.code>{EMAIL}</Typography.code>
                  </span>,
                );
            });
          }}
        >
          {EMAIL}
        </button>
      </p>
    </footer>
  );
}
