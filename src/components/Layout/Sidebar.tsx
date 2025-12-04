import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { menuConfig, type MenuItem } from '../../constants/menuConfig';
import { ChevronDown, Smartphone, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['kt']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]));
  };

  const isActiveSubmenu = (path: string) => location.pathname === path;

  return (
    <aside className="no-print w-64 border-r bg-card flex flex-col h-full">
      {/* 로고 헤더 */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">선불요금제</h1>
          <p className="text-xs text-muted-foreground">신청서 관리</p>
        </div>
      </div>

      <Separator />

      {/* 메뉴 */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <p className="px-3 text-xs font-medium text-muted-foreground mb-2">통신사</p>
          {menuConfig.map((menu: MenuItem) => (
            <div key={menu.id}>
              <Button variant="ghost" className={cn('w-full justify-between', expandedMenus.includes(menu.id) && 'bg-accent')} onClick={() => toggleMenu(menu.id)}>
                <span className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  {menu.label}
                </span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', expandedMenus.includes(menu.id) && 'rotate-180')} />
              </Button>

              {expandedMenus.includes(menu.id) && (
                <div className="ml-4 mt-1 space-y-1">
                  {menu.submenus.length > 0 ? (
                    menu.submenus.map((submenu) => (
                      <Button key={submenu.id} variant={isActiveSubmenu(submenu.path) ? 'secondary' : 'ghost'} size="sm" className={cn('w-full justify-start pl-6', isActiveSubmenu(submenu.path) && 'bg-primary text-primary-foreground hover:bg-primary/90')} onClick={() => navigate(submenu.path)}>
                        {submenu.label}
                      </Button>
                    ))
                  ) : (
                    <p className="pl-6 py-2 text-xs text-muted-foreground">준비 중</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      {/* 푸터 */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground text-center">© 2025 MyAnGoal</p>
      </div>
    </aside>
  );
}
