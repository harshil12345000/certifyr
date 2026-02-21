import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sendChatMessage, ChatMessage, OrgInfo } from '@/lib/groq-client';
import { useAIContext } from '@/hooks/useAIContext';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SESSION_STORAGE_KEY = 'ai_widget_session_id';

export interface UseAIChatReturn {
  messages: ChatMessage[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isGenerating: boolean;
  isDocumentGeneration: boolean;
  loadingMessage: string;
  sendMessage: (content: string) => Promise<void>;
  employeeDataCount: number;
  contextCountry?: string;
}

export function useAIChat(
  userId: string | undefined,
  organizationId: string | null,
  orgInfo: OrgInfo
): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDocumentGeneration, setIsDocumentGeneration] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');
  
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;
  
  const { contextCountry } = useAIContext();
  const { employeeData, loadData } = useEmployeeData();
  const navigate = useNavigate();
  const loadingRef = useRef(false);

  useEffect(() => {
    if (organizationId) {
      loadData(organizationId);
    }
  }, [organizationId, loadData]);

  const loadOrCreateSession = useCallback(async () => {
    if (!organizationId || !userId) return;

    const storedSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    
    if (storedSessionId) {
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .select('messages')
        .eq('id', storedSessionId)
        .eq('organization_id', organizationId)
        .single();

      if (!error && data && data.messages) {
        setSessionId(storedSessionId);
        setMessages(data.messages as unknown as ChatMessage[]);
        return;
      }
    }

    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        title: 'Widget Chat',
        messages: [],
      })
      .select()
      .single();

    if (!error && data) {
      setSessionId(data.id);
      sessionStorage.setItem(SESSION_STORAGE_KEY, data.id);
    }
  }, [organizationId, userId]);

  useEffect(() => {
    if (organizationId && userId && !sessionId) {
      loadOrCreateSession();
    }
  }, [organizationId, userId, sessionId, loadOrCreateSession]);

  const saveMessages = useCallback(async (newMessages: ChatMessage[]) => {
    if (!sessionId) return;
    
    await supabase
      .from('ai_chat_sessions')
      .update({ 
        messages: newMessages as unknown as string,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  }, [sessionId]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loadingRef.current) return;
    
    loadingRef.current = true;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messagesRef.current, userMessage];
    setMessages(updatedMessages);

    setIsGenerating(true);
    setLoadingMessage('Thinking...');

    const today = new Date();
    const issueDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    try {
      setLoadingMessage('Searching records...');
      
      const response = await sendChatMessage(
        updatedMessages,
        employeeData as Record<string, unknown>[],
        { model: 'sarvam-m' },
        orgInfo,
        issueDate,
        contextCountry,
        organizationId || undefined,
      );

      if (response.type === 'disambiguate' && response.matches) {
        const disambiguateContent = `DISAMBIGUATE:${JSON.stringify(response.matches)}`;
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: disambiguateContent,
          timestamp: Date.now(),
        };
        const newMessages = [...updatedMessages, assistantMessage];
        setMessages(newMessages);
        await saveMessages(newMessages);
        return;
      }

      const aiContent = response.message || '';

      if (!aiContent || aiContent.trim() === '') {
        throw new Error('Empty response from AI');
      }

      const parsed = parseGenerationResponse(aiContent);
      
      if (parsed) {
        setIsDocumentGeneration(true);
        setLoadingMessage('Generating document...');
        const { templateId, data } = parsed;
        const recipientName = data.fullName || data.name || 'Document';
        const templateLabel = templateId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const queryString = new URLSearchParams(data).toString();
        const docLink = `/documents/${templateId}?${queryString}`;

        const generatedMessage: ChatMessage = {
          role: 'assistant',
          content: `GENERATED_LINK:${templateLabel}:${recipientName}:${docLink}`,
          timestamp: Date.now(),
        };
        const newMessages = [...updatedMessages, generatedMessage];
        setMessages(newMessages);
        await saveMessages(newMessages);
        navigate(docLink);
        toast.success(`Opening ${templateLabel} for ${recipientName}`);
      } else {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: aiContent,
          timestamp: Date.now(),
        };
        const newMessages = [...updatedMessages, assistantMessage];
        setMessages(newMessages);
        await saveMessages(newMessages);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: Date.now(),
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      await saveMessages(newMessages);
      toast.error(error instanceof Error ? error.message : 'Failed to get response');
    } finally {
      setIsGenerating(false);
      setIsDocumentGeneration(false);
      setLoadingMessage('Thinking...');
      loadingRef.current = false;
    }
  }, [employeeData, orgInfo, contextCountry, organizationId, navigate, saveMessages]);

  return {
    messages,
    isOpen,
    setIsOpen,
    isGenerating,
    isDocumentGeneration,
    loadingMessage,
    sendMessage: handleSendMessage,
    employeeDataCount: employeeData.length,
    contextCountry,
  };
}

function parseGenerationResponse(aiContent: string) {
  // Try LINK format first
  const linkMatch = aiContent.match(/\[LINK:([^\]]+)\]/);
  if (linkMatch) {
    try {
      const templateId = linkMatch[1];
      const dataMatch = aiContent.match(/\[DATA:([^\]]+)\]/);
      const data = dataMatch ? JSON.parse(dataMatch[1]) : {};
      return { templateId, data };
    } catch {
      return null;
    }
  }

  // Try GENERATE_DOCUMENT format from LLM
  const generateMatch = aiContent.match(/GENERATE_DOCUMENT:([^:]+):(.+)/);
  if (generateMatch) {
    try {
      const templateId = generateMatch[1].trim();
      const data = JSON.parse(generateMatch[2].trim());
      return { templateId, data };
    } catch {
      return null;
    }
  }

  return null;
}
