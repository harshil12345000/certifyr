import { useState, useEffect, useCallback } from 'react';
import { Sparkles, X, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { useAIChat } from '@/hooks/useAIChat';
import { ChatInterface } from '@/components/ai-assistant/ChatInterface';
import { Button } from '@/components/ui/button';
import { OrgInfo } from '@/lib/groq-client';
import { cn } from '@/lib/utils';

interface AIFloatingWidgetProps {
  className?: string;
}

export function AIFloatingWidget({ className }: AIFloatingWidgetProps) {
  const { user } = useAuth();
  const { organizationId, organizationDetails, userProfile } = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const orgInfo: OrgInfo = {
    name: organizationDetails?.name || 'Unknown Organization',
    address: organizationDetails?.address || '',
    place: organizationDetails?.address?.split(',').pop()?.trim() || userProfile?.organizationLocation || '',
    email: organizationDetails?.email || '',
    phone: organizationDetails?.phone || '',
    signatoryName: userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}`.trim() 
      : '',
    signatoryDesignation: userProfile?.designation || '',
    organizationType: userProfile?.organizationType || '',
    organizationLocation: userProfile?.organizationLocation || '',
  };

  const {
    messages,
    isGenerating,
    isDocumentGeneration,
    loadingMessage,
    sendMessage,
    employeeDataCount,
    contextCountry,
  } = useAIChat(user?.id, organizationId, orgInfo);

  const handleSend = useCallback(async (content: string) => {
    await sendMessage(content);
  }, [sendMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!user || !organizationId) return null;

  return (
    <>
      <div 
        className={cn("fixed bottom-6 right-20 z-40 flex flex-col items-end", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isOpen && (
          <div className="mb-3 bg-background rounded-lg shadow-2xl border overflow-hidden w-[380px] h-[500px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <ChatInterface
              messages={messages}
              onSendMessage={handleSend}
              employeeDataCount={employeeDataCount}
              contextCountry={contextCountry}
              isGenerating={isGenerating}
              isDocumentGeneration={isDocumentGeneration}
              loadingMessage={loadingMessage}
              minimal
            />
          </div>
        )}

        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-12 w-12 rounded-full shadow-lg transition-all duration-200",
            "bg-blue-600 hover:bg-blue-700 text-white",
            isOpen && "rotate-90",
            isHovered && "scale-110"
          )}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </Button>
        
        {!isOpen && (
          <div className={cn(
            "mr-1 mb-2 px-2 py-1 bg-white rounded-md shadow border text-xs text-muted-foreground whitespace-nowrap transition-all duration-200",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          )}>
            Chat with AI
          </div>
        )}
      </div>
    </>
  );
}
