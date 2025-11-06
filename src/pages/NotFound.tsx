import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Home } from "lucide-react";
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    // Track 404 silently without logging
  }, [location.pathname]);
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-certifyr-blue-light via-white to-white p-4">
      <div className="text-center max-w-md glass-card p-8 animate-fade-in">
        
        <h1 className="text-4xl font-bold mb-4 text-certifyr-blue-dark">404 Error</h1>
        <p className="text-xl text-gray-600 mb-6">Uh oh! This page doesn't exist.</p>
        <p className="text-muted-foreground mb-8">This page is unavailable at the moment.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="gradient-blue gap-2" asChild>
            <a href="/">
              <Home className="h-4 w-4" /> Return to Dashboard
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/templates">Browse Documents <FileText className="h-4 w-4 mr-2" /> Browse Templates
            </a>
          </Button>
        </div>
      </div>
    </div>;
};
export default NotFound;