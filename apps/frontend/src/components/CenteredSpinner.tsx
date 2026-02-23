import { Spinner } from '@/components/ui/spinner';

const CenteredSpinner = () => {
  return (
    <div className='pointer-events-none absolute inset-0 flex select-none items-center justify-center opacity-65'>
      <Spinner className='size-8' />
    </div>
  );
};

export default CenteredSpinner;
