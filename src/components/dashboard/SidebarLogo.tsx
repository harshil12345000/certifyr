import { cn } from '@/lib/utils';
import { useBranding } from '@/contexts/BrandingContext';

interface SidebarLogoProps {
  collapsed?: boolean;
}

export function SidebarLogo({
  collapsed = false
}: SidebarLogoProps) {
  const { logoUrl, isLoading } = useBranding();

  return (
    <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-md flex items-center justify-center relative">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin absolute" />
          ) : (
            <img 
              src={logoUrl || "/lovable-uploads/7a143eed-6a95-4de8-927e-7c3572ae8a12.png"} 
              alt="Certifyr Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Error loading logo in sidebar");
                (e.target as HTMLImageElement).src = "/lovable-uploads/7a143eed-6a95-4de8-927e-7c3572ae8a12.png";
              }}
            />
          )}
        </div>
        {!collapsed && <span className="ml-2 text-lg font-semibold text-foreground">
            Certifyr
          </span>}
      </div>
    </div>
  );
}
