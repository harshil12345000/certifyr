import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { useAIChat } from '@/hooks/useAIChat';
import { ChatInterface } from '@/components/ai-assistant/ChatInterface';
import { Button } from '@/components/ui/button';
import { OrgInfo } from '@/lib/groq-client';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';

interface AIFloatingWidgetProps {
  className?: string;
}

function AIFloatingWidgetComponent({ className }: AIFloatingWidgetProps) {
  const { user } = useAuth();
  const { organizationId, organizationDetails, userProfile } = useBranding();
  const { subscription } = useSubscription();
  
  const isUltraPlan = subscription?.active_plan?.toLowerCase() === 'ultra';
  
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const orgInfo = useMemo<OrgInfo>(() => ({
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
  }), [organizationDetails, userProfile]);

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

  const handleDisambiguationSelect = useCallback(async (match: { name: string; id: string; department: string }) => {
    const msg = match.id 
      ? `I'm referring to ${match.name} (ID: ${match.id})`
      : `I'm referring to ${match.name}`;
    await handleSend(msg);
  }, [handleSend]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!user || !organizationId || !isUltraPlan) return null;

  return (
    <div 
      className={cn("fixed bottom-6 right-20 z-40 flex flex-col-reverse items-end", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isOpen && (
        <div style={{ width: '380px', height: '420px' }} className="mb-3 mr-0 bg-background rounded-lg shadow-2xl border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
          <div className="flex items-center justify-between px-3 py-2.5 bg-blue-600 text-white shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium text-sm">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <ChatInterface
            messages={messages}
            onSendMessage={handleSend}
            onDisambiguationSelect={handleDisambiguationSelect}
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
          isHovered
            ? "opacity-100 translate-y-0 translate-x-6"
            : "opacity-0 translate-y-2 translate-x-6 pointer-events-none"
        )}>
          AI Assistant
        </div>
      )}
    </div>
  );
}

export const AIFloatingWidget = React.memo(AIFloatingWidgetComponent);
