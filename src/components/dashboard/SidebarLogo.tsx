
import { cn } from '@/lib/utils';

interface SidebarLogoProps {
  collapsed?: boolean;
}

export function SidebarLogo({ collapsed = false }: SidebarLogoProps) {
  return (
    <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-certifyr-blue to-certifyr-blue-dark flex items-center justify-center">
          <span className="text-white text-xl font-bold">C</span>
        </div>
        {!collapsed && (
          <span className="ml-2 text-lg font-semibold text-foreground">
            Certifyr
          </span>
        )}
      </div>
    </div>
  );
}
