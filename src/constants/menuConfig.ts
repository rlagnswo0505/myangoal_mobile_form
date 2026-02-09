export interface SubMenuItem {
  id: string;
  label: string;
  path: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  submenus: SubMenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    id: 'kt',
    label: 'KT',
    icon: '📱',
    submenus: [
      { id: 'kt-asia', label: '선불 KT 아시아', path: '/kt/asia' },
      { id: 'kt-asia-transfer', label: 'KT아시아 명변', path: '/kt/asia-transfer' },
    ],
  },
  {
    id: 'skt',
    label: 'SKT',
    icon: '📱',
    submenus: [{ id: 'joytel-prepaid', label: '조이텔 선불-명변', path: '/skt/joytel-prepaid' }],
  },
  {
    id: 'lg',
    label: 'LG U+',
    icon: '📱',
    submenus: [
      { id: 'lg-story', label: '이야기 선불', path: '/lg/story' },
      { id: 'lg-story-transfer', label: '이야기 명의변경', path: '/lg/story-transfer' },
      { id: 'lg-ins', label: '인스 선불-명변', path: '/lg/ins' },
      { id: 'lg-ins-postpaid', label: '인스 후불', path: '/lg/ins-postpaid' },
    ],
  },
];
