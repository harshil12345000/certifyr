
import { cn } from '@/lib/utils';

interface SidebarLogoProps {
  collapsed?: boolean;
}

export function SidebarLogo({
  collapsed = false
}: SidebarLogoProps) {
  return (
    <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-md flex items-center justify-center">
          <img 
            src="/lovable-uploads/2918a4ef-1411-43c6-8715-9d6a7a57bf2a.png" 
            alt="Certifyr Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        {!collapsed && <span className="ml-2 text-lg font-semibold text-foreground">
            Certifyr
          </span>}
      </div>
    </div>
  );
}
