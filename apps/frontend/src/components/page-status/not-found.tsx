import { Link } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import NotFoundSvg from '@/assets/404.svg?react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
      <div className='flex flex-col items-center text-center max-w-md'>
        <div className='relative mb-6'>
          <NotFoundSvg className='object-contain w-100 h-fit pointer-events-none select-none' />
        </div>

        <h1 className='text-3xl font-bold text-foreground mb-2'>Không tìm thấy trang</h1>
        <p className='text-muted-foreground mb-6'>
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
        </p>

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

export default NotFound;
