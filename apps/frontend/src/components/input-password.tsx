import { Asterisk, Check, Copy, Eye, EyeOff, KeyRoundIcon, RefreshCcw } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import Typography from '@/components/typography';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { generateRandomPassword } from '@/lib/randomGenerators';

function InputPassword({
  onGeneratePassword,
  ...props
}: React.ComponentProps<'input'> & {
  onGeneratePassword?: (randomPassword: string) => void;
}) {
  const [type, setType] = React.useState<'password' | 'text'>('password');
  const ref = React.useRef<HTMLInputElement>(null);
  const isSupportGeneratePassword = !!onGeneratePassword;
  const [copy, isCopied] = useCopyToClipboard();
  return (
    <InputGroup>
      <InputGroupInput type={type} {...props} ref={ref} />
      {props.name && (
        <InputGroupAddon align='inline-start' className='gap-0 border-r pr-2'>
          <KeyRoundIcon />
        </InputGroupAddon>
      )}
      <InputGroupAddon align='inline-end' className='gap-0'>
        {isSupportGeneratePassword && (
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label='copy-password'
                size='icon-xs'
                onClick={() => {
                  copy(ref.current!.value);
                  toast.success(
                    <p>
                      Đã sao chép mật khẩu <Typography.code>{ref.current!.value}</Typography.code>{' '}
                      vào bộ nhớ tạm!
                    </p>,
                    { id: 'copy' },
                  );
                }}
                className='relative'
              >
                {!isCopied ? <Copy /> : <Check className='stroke-success' />}
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Copy mật khẩu</TooltipContent>
          </Tooltip>
        )}
        {isSupportGeneratePassword && (
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label='generate-random-password'
                size='icon-xs'
                onClick={() => {
                  setType('text');
                  onGeneratePassword(generateRandomPassword());
                }}
                className='relative'
              >
                <RefreshCcw />
                <Asterisk className='absolute left-1/2 top-1/2 -translate-1/2 size-2' />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Tạo mật khẩu ngẫu nhiên</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <InputGroupButton
              aria-label='hide-password'
              size='icon-xs'
              onClick={() => {
                setType((old) => (old === 'password' ? 'text' : 'password'));
              }}
            >
              {type === 'password' ? <Eye /> : <EyeOff />}
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent>{'Nhấn để ẩn/hiện mật khẩu'}</TooltipContent>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  );
}
export { InputPassword };
