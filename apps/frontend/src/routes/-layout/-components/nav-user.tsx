import { IconDotsVertical, IconLogout } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { KeyRound, Palette, User } from 'lucide-react';
import { COLOR_THEMES, type ColorTheme, useTheme } from '@/components/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { currentUserRepository } from '@/repositories/currentUser.repository';

const THEME_LABELS: Record<ColorTheme, string> = {
  default: 'Mặc định',
  'golden-hour': 'Hoàng hôn vàng',
  'desert-rose': 'Hồng sa mạc',
  'midnight-galaxy': 'Ngân hà đêm',
  'modern-minimalist': 'Tối giản hiện đại',
  'arctic-frost': 'Băng giá Bắc Cực',
  'forest-canopy': 'Tán rừng xanh',
  'tech-innovation': 'Công nghệ sáng tạo',
  'botanical-garden': 'Vườn thực vật',
  'ocean-depths': 'Đại dương sâu thẳm',
  'sunset-boulevard': 'Đại lộ hoàng hôn',
  'code-nexus': 'Code Nexus',
};

const THEME_COLORS: Record<ColorTheme, string> = {
  default: 'oklch(0.55 0.15 250)',
  'golden-hour': 'oklch(0.78 0.16 85)',
  'desert-rose': 'oklch(0.72 0.08 15)',
  'midnight-galaxy': 'oklch(0.42 0.1 280)',
  'modern-minimalist': 'oklch(0.38 0.015 240)',
  'arctic-frost': 'oklch(0.52 0.1 250)',
  'forest-canopy': 'oklch(0.38 0.1 140)',
  'tech-innovation': 'oklch(0.55 0.22 260)',
  'botanical-garden': 'oklch(0.52 0.1 150)',
  'ocean-depths': 'oklch(0.55 0.12 195)',
  'sunset-boulevard': 'oklch(0.62 0.19 35)',
  'code-nexus': 'oklch(0.55 0.23 265)',
};

export function NavUser() {
  const { isMobile } = useSidebar();
  const { colorTheme, setColorTheme } = useTheme();

  const { data: currentUser } = currentUserRepository().useQuery();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <User />
              {currentUser.displayName}
              <IconDotsVertical className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <User />
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{currentUser.displayName}</span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {currentUser.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to='/auth/change-password'>
                  <KeyRound />
                  Đổi mật khẩu
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette />
                  Màu chủ đề
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {COLOR_THEMES.map((t) => (
                      <DropdownMenuItem
                        key={t}
                        className={colorTheme === t ? 'bg-accent' : ''}
                        onSelect={(e) => {
                          e.preventDefault();
                          setColorTheme(t);
                        }}
                      >
                        <span
                          className='size-3 shrink-0 rounded-full border'
                          style={{ backgroundColor: THEME_COLORS[t] }}
                        />
                        {THEME_LABELS[t]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to='/auth/sign-out'>
                <IconLogout />
                Đăng xuất
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
