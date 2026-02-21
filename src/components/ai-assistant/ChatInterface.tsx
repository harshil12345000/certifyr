import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, FileSpreadsheet, Globe, MoveUp } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { LoadingPlaceholder } from './LoadingPlaceholder';
import { ChatMessage } from '@/hooks/useChatSessions';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  employeeDataCount: number;
  contextCountry?: string;
  isGenerating?: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  employeeDataCount,
  contextCountry,
  isGenerating,
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-blue-100 mb-4">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">How can I help you?</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              I can help you generate certificates and documents. Just tell me what you need!
            </p>
            
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

            {employeeDataCount === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 max-w-md">
                <strong>Tip:</strong> Upload employee data in Organization &gt; Data tab for faster certificate generation.
              </div>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}
        
        {isGenerating && (
          <LoadingPlaceholder message="Generating document..." />
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
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
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
