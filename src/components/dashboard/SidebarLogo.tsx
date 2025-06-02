
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { supabase, getLatestBrandingSettings } from '@/integrations/supabase/client';

interface SidebarLogoProps {
  collapsed?: boolean;
}

export function SidebarLogo({
  collapsed = false
}: SidebarLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadBrandingLogo = async () => {
      try {
        setIsLoading(true);
        // Get the latest branding settings
        const brandingSettings = await getLatestBrandingSettings();
        
        if (brandingSettings?.logo) {
          const timestamp = new Date().getTime(); // Add timestamp to prevent caching
          const { data } = supabase.storage.from('branding').getPublicUrl(`logos/${brandingSettings.logo}?t=${timestamp}`);
          setLogoUrl(data.publicUrl);
          console.log("Sidebar Logo URL:", data.publicUrl);
        }
      } catch (err) {
        console.error("Error loading branding logo:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBrandingLogo();
  }, []);

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
