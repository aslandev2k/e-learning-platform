import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function SectionCards() {
  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Tổng doanh thu</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Tăng trong tháng này <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Lượt truy cập 6 tháng gần nhất</div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Người dùng mới</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Giảm 20% trong kỳ này <IconTrendingDown className='size-4' />
          </div>
          <div className='text-muted-foreground'>Cần chú ý thu hút người dùng</div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Tài khoản hoạt động</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Tỷ lệ giữ chân người dùng tốt <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Mức độ tương tác vượt mục tiêu</div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Tỷ lệ tăng trưởng</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Hiệu suất tăng ổn định <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Đạt mục tiêu tăng trưởng</div>
        </CardFooter>
      </Card>
    </div>
  );
}
