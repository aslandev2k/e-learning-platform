import { RefreshCw } from 'lucide-react';
import ServiceUnavailableSvg from '@/assets/503.svg?react';
import { Button } from '@/components/ui/button';

type ServiceUnavailableProps = {
  message?: string;
};

const ServiceUnavailable = ({ message }: ServiceUnavailableProps) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
      <div className='flex flex-col items-center text-center max-w-md'>
        <div className='relative mb-6'>
          <ServiceUnavailableSvg className='object-contain w-100 h-fit pointer-events-none select-none' />
        </div>

        <h1 className='text-3xl font-bold text-foreground mb-2 whitespace-nowrap'>
          Dịch vụ tạm thời không khả dụng
        </h1>
        <div className='text-muted-foreground mb-6'>
          {message ? (
            <p>{message}</p>
          ) : (
            <p>
              Hệ thống đang bảo trì hoặc quá tải.
              <br />
              Vui lòng thử lại sau ít phút.
            </p>
          )}
        </div>

        <div className='flex gap-3'>
          <Button variant='outline' onClick={() => window.location.reload()}>
            <RefreshCw className='size-4' />
            Thử lại
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceUnavailable;
