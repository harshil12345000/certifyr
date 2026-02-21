import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, FileSpreadsheet, Globe } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
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
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync local messages with prop messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const message = input.trim();
    const userMessage: ChatMessage = { role: 'user', content: message, timestamp: Date.now() };
    
    // Immediately show the user message
    setLocalMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the message if it failed
      setLocalMessages(prev => prev.filter(m => m !== userMessage));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayMessages = localMessages.length > 0 ? localMessages : messages;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-purple-100 mb-4">
              <Bot className="h-8 w-8 text-purple-600" />
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
          displayMessages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}
        
        {(sending || isGenerating) && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-purple-600" />
            </div>
            <div className="bg-muted px-4 py-2 rounded-lg rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="min-h-[44px] max-h-[200px] resize-none"
            disabled={sending || isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending || isGenerating}
            size="icon"
            className="h-auto px-4"
          >
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
