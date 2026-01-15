'use client';

import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Smartphone } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navigate = useNavigate();

  const navMain = [
    {
      title: 'KT',
      url: '#',
      icon: Smartphone,
      isActive: location.pathname.startsWith('/kt'),
      items: [
        {
          title: '선불 KT 아시아',
          url: '/kt/asia',
          isActive: location.pathname === '/kt/asia',
        },
      ],
    },
    {
      title: 'SKT',
      url: '#',
      icon: Smartphone,
      isActive: location.pathname.startsWith('/skt'),
      items: [
        {
          title: '조이텔 선불-명변',
          url: '/skt/joytel-prepaid',
          isActive: location.pathname === '/skt/joytel-prepaid',
        },
      ],
    },
    {
      title: 'LG U+',
      url: '#',
      icon: Smartphone,
      isActive: location.pathname.startsWith('/lg'),
      items: [
        {
          title: '선불 LG 이야기',
          url: '/lg/story',
          isActive: location.pathname === '/lg/story',
        },
        {
          title: '이야기 명의변경',
          url: '/lg/story-transfer',
          isActive: location.pathname === '/lg/story-transfer',
        },
        {
          title: '인스 선불-명변',
          url: '/lg/ins',
          isActive: location.pathname === '/lg/ins',
        },
        {
          title: '인스 후불',
          url: '/lg/ins-postpaid',
          isActive: location.pathname === '/lg/ins-postpaid',
        },
        {
          title: '한패스 선불-명변',
          url: '/lg/hanpass',
          isActive: location.pathname === '/lg/hanpass',
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => navigate('/')}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">선불요금제</span>
                <span className="truncate text-xs">신청서 관리</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
