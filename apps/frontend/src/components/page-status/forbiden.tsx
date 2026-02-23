import { Link } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ForbidenProps = {
  message?: string;
  pageName?: string;
};

const Forbiden = ({ message, pageName }: ForbidenProps) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
      <div className='flex flex-col items-center text-center max-w-md'>
        <div className='relative mb-6'>
          <img
            src='/403.avif'
            alt='403'
            className='object-contain w-100 pointer-events-none select-none'
          />
        </div>

        <h1 className='text-3xl font-bold text-foreground mb-2'>Truy cập bị từ chối</h1>
        <div className='text-muted-foreground mb-6'>
          {message ? (
            <p>{message}</p>
          ) : (
            <p>
              Bạn không có quyền truy cập
              {pageName && (
                <>
                  {' '}
                  <span className='font-semibold text-foreground'>{pageName}</span>.
                </>
              )}
              {!pageName && ' trang này.'} Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là
              lỗi.
            </p>
          )}
        </div>

        <div className='flex gap-3'>
          <Button variant='outline' asChild>
            <Link to='/app' reloadDocument>
              <Home className='size-4' />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forbiden;
