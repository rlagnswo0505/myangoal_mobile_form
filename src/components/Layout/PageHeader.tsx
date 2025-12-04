import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer, MousePointer2 } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  debugMode: boolean;
  onDebugToggle: () => void;
  onPrint: () => void;
}

export default function PageHeader({ title, subtitle, debugMode, onDebugToggle, onPrint }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background px-6 py-4 border-b">
      <Card className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={debugMode ? 'destructive' : 'outline'} size="sm" onClick={onDebugToggle}>
            <MousePointer2 className="w-4 h-4 mr-2" />
            {debugMode ? '좌표 모드 OFF' : '좌표 확인'}
          </Button>
          <Button onClick={onPrint}>
            <Printer className="w-4 h-4 mr-2" />
            출력하기
          </Button>
        </div>
      </Card>
    </div>
  );
}
