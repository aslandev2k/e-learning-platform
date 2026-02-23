import { Link, useLocation } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { FileRouteTypes } from '@/routeTree.gen';

// TODO: Thêm quick links mới cho domain ELP tại đây
const documents: {
  name: string;
  icon: LucideIcon;
  to: FileRouteTypes['to'];
  search?: Record<string, any>;
  isLink?: boolean;
}[] = [];

export function NavDocuments() {
  const location = useLocation();

  if (documents.length === 0) return null;

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel>Tiện ích</SidebarGroupLabel>
      <SidebarMenu>
        {documents.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              isActive={!item.isLink && location.pathname.includes(item.to)}
            >
              <Link
                to={item.to}
                search={item.search}
                reloadDocument={location.pathname.includes(item.to)}
              >
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
