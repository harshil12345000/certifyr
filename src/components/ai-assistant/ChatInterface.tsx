import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, FileSpreadsheet, Globe, MoveUp } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { LoadingPlaceholder } from './LoadingPlaceholder';
import { ChatMessage } from '@/hooks/useChatSessions';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onDisambiguationSelect?: (match: { name: string; id: string; department: string }) => void;
  employeeDataCount: number;
  contextCountry?: string;
  isGenerating?: boolean;
  isDocumentGeneration?: boolean;
  loadingMessage?: string;
  loading?: boolean;
  minimal?: boolean;
  personInfoRecord?: Record<string, unknown>;
  personInfoTemplateName?: string;
  missingFields?: string[];
  collectedFields?: Record<string, string>;
  templateName?: string;
  onFieldChange?: (field: string, value: string) => void;
  onFieldSubmit?: () => void;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onDisambiguationSelect,
  employeeDataCount,
  contextCountry,
  isGenerating,
  isDocumentGeneration,
  loadingMessage,
  loading,
  minimal = false,
  personInfoRecord,
  personInfoTemplateName,
  missingFields,
  collectedFields,
  templateName,
  onFieldChange,
  onFieldSubmit,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const message = input.trim();
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine loading message
  const currentLoadingMessage = isDocumentGeneration 
    ? 'Generating document...' 
    : loadingMessage || 'Thinking...';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading ? (
          <div className={`flex flex-col items-center justify-center h-full text-center ${minimal ? 'px-2' : ''}`}>
            <div className={`rounded-full bg-blue-100 mb-3 ${minimal ? 'p-2' : 'p-4'}`}>
              <Sparkles className={minimal ? 'h-5 w-5 text-blue-600' : 'h-8 w-8 text-blue-600'} />
            </div>
            <h3 className={`font-semibold mb-1 ${minimal ? 'text-sm' : 'text-lg'}`}>How can I help you?</h3>
            <p className={`text-muted-foreground mb-3 ${minimal ? 'text-xs max-w-xs' : 'text-sm max-w-md'}`}>
              I can help you generate certificates and documents. Just tell me what you need!
            </p>
            
            {!minimal && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{employeeDataCount} employee records</span>
                </div>
                {contextCountry && contextCountry !== 'global' && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{contextCountry}</span>
                  </div>
                )}
              </div>
            )}

            {minimal && employeeDataCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileSpreadsheet className="h-3 w-3" />
                <span>{employeeDataCount} records</span>
              </div>
            )}

            {employeeDataCount === 0 && (
              <div className={`bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 ${minimal ? 'p-2 text-xs max-w-[200px]' : 'p-3 text-sm max-w-md mt-4'}`}>
                <strong>Tip:</strong> {minimal ? 'Upload data for faster generation.' : 'Upload employee data in Organization > Data tab for faster certificate generation.'}
              </div>
            )}
          </div>
        ) : messages.length === 0 && loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingPlaceholder message="Loading session..." />
          </div>
        ) : (
          messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              return (
                <MessageBubble 
                  key={index} 
                  message={message}
                  onDisambiguationSelect={onDisambiguationSelect}
                  personInfoRecord={isLastMessage ? personInfoRecord : undefined}
                  personInfoTemplateName={isLastMessage ? personInfoTemplateName : undefined}
                  missingFields={isLastMessage ? missingFields : undefined}
                  collectedFields={isLastMessage ? collectedFields : undefined}
                  templateName={isLastMessage ? templateName : undefined}
                  onFieldChange={isLastMessage ? onFieldChange : undefined}
                  onFieldSubmit={isLastMessage ? onFieldSubmit : undefined}
                />
              );
            })
        )}
        
        {isGenerating && (
          <LoadingPlaceholder message={currentLoadingMessage} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your message..."
            className="min-h-[40px] max-h-[200px] resize-none py-3"
            disabled={isGenerating}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            size="icon"
            className="h-auto px-4"
          >
            <MoveUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
