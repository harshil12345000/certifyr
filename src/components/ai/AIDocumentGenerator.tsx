
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIDocumentGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to the AI Document Generator! Describe the legal document you need, and I\'ll help generate it for you using the Indian Kanoon database.'
    }
  ]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: prompt };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setPrompt('');
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the Indian Kanoon API via Edge Function
      // For now, we'll simulate a response
      
      // Simulated API call (replace with actual implementation)
      setTimeout(() => {
        const response = {
          documentTemplate: `This is a template based on your request: "${prompt}".\n\nThe document would typically include legal clauses related to your query, formatted according to Indian legal standards.`,
          suggestedActions: ["Review for accuracy", "Add company details", "Include digital signature"]
        };
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.documentTemplate 
        }]);
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>AI Document Generator</CardTitle>
        <CardDescription>
          Generate legal document templates using AI and the Indian Kanoon database
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="h-[400px] overflow-y-auto border rounded-md p-4 bg-background">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 p-3 rounded-lg ${
                message.role === 'assistant' 
                  ? 'bg-primary/10 mr-12' 
                  : 'bg-secondary ml-12'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Generating document...</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea 
              placeholder="Describe the document you need... (e.g., 'I need a template for a rental agreement for commercial property in Delhi')"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button 
            type="submit" 
            className="gradient-blue"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-2">Send</span>
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-xs text-muted-foreground">
          Powered by Indian Kanoon API
        </div>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Save to Templates
        </Button>
      </CardFooter>
    </Card>
  );
}
