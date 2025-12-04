import { FileText } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="no-print h-14 bg-white border-b flex items-center px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </header>
  );
}
