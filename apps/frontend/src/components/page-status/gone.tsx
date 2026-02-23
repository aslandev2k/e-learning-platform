import { Link } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import NotFoundSvg from '@/assets/404.svg?react';
import { Button } from '@/components/ui/button';

type GoneProps = {
  message?: string;
  pageName?: string;
};

const Gone = ({ message, pageName }: GoneProps) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
      <div className='flex flex-col items-center text-center max-w-md'>
        <div className='relative mb-6'>
          <NotFoundSvg className='object-contain w-100 h-fit pointer-events-none select-none' />
        </div>

        <h1 className='text-3xl font-bold text-foreground mb-2'>Tài nguyên không còn tồn tại</h1>
        <div className='text-muted-foreground mb-6'>
          {message ? (
            <p>{message}</p>
          ) : (
            <p>
              {pageName && (
                <>
                  <span className='font-semibold text-foreground'>{pageName}</span> đã bị xóa hoặc
                  không còn khả dụng.
                </>
              )}
              {!pageName && 'Dữ liệu bạn đang tìm kiếm đã bị xóa hoặc không còn khả dụng.'}
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

export default Gone;
