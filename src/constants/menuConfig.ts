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
    submenus: [{ id: 'kt-asia', label: '선불 KT 아시아', path: '/kt/asia' }],
  },
  {
    id: 'skt',
    label: 'SKT',
    icon: '📱',
    submenus: [],
  },
  {
    id: 'lg',
    label: 'LG U+',
    icon: '📱',
    submenus: [],
  },
];
