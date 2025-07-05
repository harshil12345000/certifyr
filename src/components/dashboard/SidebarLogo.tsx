import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  collapsed?: boolean;
}

export function SidebarLogo({ collapsed = false }: SidebarLogoProps) {
  return (
    <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-md flex items-center justify-center relative">
          <img
            src="/uploads/30a6a699-ff30-486d-8225-816f6de9650e.png"
            alt="Certifyr Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (
                !target.src.endsWith("7a143eed-6a95-4de8-927e-7c3572ae8a12.png")
              ) {
                target.src =
                  "/uploads/7a143eed-6a95-4de8-927e-7c3572ae8a12.png";
              } else {
                target.style.display = "none";
              }
            }}
          />
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
