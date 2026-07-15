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
        {
          title: 'KT아시아 명변',
          url: '/kt/asia-transfer',
          isActive: location.pathname === '/kt/asia-transfer',
        },
        {
          title: 'KT 더원 신규',
          url: '/kt/theone',
          isActive: location.pathname === '/kt/theone',
        },
        {
          title: '메인 KT 신청',
          url: '/kt/main-application',
          isActive: location.pathname === '/kt/main-application',
        },
        {
          title: 'M모바일 납부변경',
          url: '/kt/mmobile-payment-change',
          isActive: location.pathname === '/kt/mmobile-payment-change',
        },
        {
          title: '스카이라이프 납부변경',
          url: '/kt/skylife-payment-change',
          isActive: location.pathname === '/kt/skylife-payment-change',
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
        {
          title: '세븐모바일 납부변경',
          url: '/skt/seven-mobile-payment-change',
          isActive: location.pathname === '/skt/seven-mobile-payment-change',
        },
        {
          title: 'SK 신규계약서',
          url: '/skt/new-contract',
          isActive: location.pathname === '/skt/new-contract',
        },
        {
          title: 'SK 명의변경서',
          url: '/skt/transfer',
          isActive: location.pathname === '/skt/transfer',
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
        {
          title: '선불 LG 아시아',
          url: '/lg/asia',
          isActive: location.pathname === '/lg/asia',
        },
        {
          title: 'LG 스마텔 선불',
          url: '/lg/smartel-prepaid',
          isActive: location.pathname === '/lg/smartel-prepaid',
        },
        {
          title: '유모바일 납부변경',
          url: '/lg/umobile-payment-change',
          isActive: location.pathname === '/lg/umobile-payment-change',
        },
        {
          title: '인스 납부변경',
          url: '/lg/ins-payment-change',
          isActive: location.pathname === '/lg/ins-payment-change',
        },
        {
          title: '헬로 납부변경',
          url: '/lg/hello-payment-change',
          isActive: location.pathname === '/lg/hello-payment-change',
        },
        {
          title: 'LG 신청서',
          url: '/lg/application',
          isActive: location.pathname === '/lg/application',
        },
        {
          title: 'LG 변경신청서',
          url: '/lg/info-change',
          isActive: location.pathname === '/lg/info-change',
        },
      ],
    },
    {
      title: '기타서식',
      url: '#',
      icon: FileText,
      isActive: location.pathname.startsWith('/etc'),
      items: [
        {
          title: '제한기간내 번호이동',
          url: '/etc/limited-transfer-within-period',
          isActive: location.pathname === '/etc/limited-transfer-within-period',
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
