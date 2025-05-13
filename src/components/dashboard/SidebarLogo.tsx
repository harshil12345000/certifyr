
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SidebarLogoProps {
  collapsed?: boolean;
}

export function SidebarLogo({
  collapsed = false
}: SidebarLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadBrandingLogo = async () => {
      try {
        // Try to get branding info from Supabase
        const { data: brandingData, error } = await supabase
          .from('branding_settings')
          .select('logo')
          .limit(1);
        
        if (brandingData && brandingData.length > 0 && brandingData[0].logo && !error) {
          const { data } = supabase.storage.from('branding').getPublicUrl(`logos/${brandingData[0].logo}`);
          setLogoUrl(data.publicUrl);
          console.log("Sidebar Logo URL:", data.publicUrl);
        }
      } catch (err) {
        console.error("Error loading branding logo:", err);
      }
    };

    loadBrandingLogo();
  }, []);

  return (
    <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-md flex items-center justify-center">
          <img 
            src={logoUrl || "/lovable-uploads/2918a4ef-1411-43c6-8715-9d6a7a57bf2a.png"} 
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
