import type { Permission } from '@repo/zod-schemas/src/permission';
import { Link, useLocation } from '@tanstack/react-router';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { currentUserRepository } from '@/repositories/currentUser.repository';
import type { FileRouteTypes } from '@/routeTree.gen';

type NavItem = {
  title: string;
  path: FileRouteTypes['to'];
  icon: any;
  permission: Permission;
};

// TODO: Thêm menu items mới cho domain ELP tại đây
const items: NavItem[] = [];

export function NavMain() {
  const location = useLocation();
  const { data: currentUser } = currentUserRepository().useQuery();
  const { setOpenMobile } = useSidebar();

  const visibleItems = items.filter((item) => currentUser.permissions.has(item.permission));

  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={location.pathname.includes(item.path)}
              >
                <Link
                  to={item.path}
                  onClick={() => {
                    setOpenMobile(false);
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
