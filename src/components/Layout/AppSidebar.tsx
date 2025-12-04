import { useLocation, useNavigate } from 'react-router-dom';
import { Smartphone, ChevronRight } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { menuConfig } from '@/constants/menuConfig';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Smartphone className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">MyAnGoal</span>
                  <span className="text-xs text-muted-foreground">선불요금제 관리</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>통신사</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuConfig.map((item) => (
                <Collapsible key={item.id} asChild defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.label}>
                        <Smartphone className="size-4" />
                        <span>{item.label}</span>
                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.submenus.map((submenu) => (
                          <SidebarMenuSubItem key={submenu.id}>
                            <SidebarMenuSubButton asChild isActive={location.pathname === submenu.path}>
                              <a
                                href={submenu.path}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(submenu.path);
                                }}
                              >
                                {submenu.label}
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                        {item.submenus.length === 0 && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <span className="text-muted-foreground cursor-default">준비중...</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
