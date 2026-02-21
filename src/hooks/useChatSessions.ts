import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface UseChatSessionsReturn {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  loading: boolean;
  error: string | null;
  createSession: () => Promise<ChatSession>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateTitle: (sessionId: string, title: string) => Promise<void>;
  addMessage: (message: ChatMessage) => Promise<ChatMessage[]>;
  clearError: () => void;
}

export function useChatSessions(userId: string | undefined, organizationId: string | null): UseChatSessionsReturn {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadSessions = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_chat_sessions' as 'announcements')
        .select('*')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false }) as unknown as { data: ChatSession[] | null; error: Error | null };

      if (fetchError) throw fetchError;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const createSession = useCallback(async (): Promise<ChatSession> => {
    if (!organizationId || !userId) {
      throw new Error('Organization or user not found');
    }

    const newSession: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'> = {
      organization_id: organizationId,
      user_id: userId,
      title: 'New Chat',
      messages: [],
    };

    const { data, error: insertError } = await supabase
      .from('ai_chat_sessions' as 'announcements')
      .insert(newSession as never)
      .select()
      .single() as unknown as { data: ChatSession; error: Error | null };

    if (insertError) throw insertError;

    setSessions(prev => [data, ...prev]);
    setCurrentSession(data);
    return data;
  }, [organizationId, userId]);

  const loadSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_chat_sessions' as 'announcements')
        .select('*')
        .eq('id', sessionId)
        .single() as unknown as { data: ChatSession; error: Error | null };

      if (fetchError) throw fetchError;
      setCurrentSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('ai_chat_sessions' as 'announcements')
        .delete()
        .eq('id', sessionId) as unknown as { error: Error | null };

      if (deleteError) throw deleteError;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const updateTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      const { error: updateError } = await supabase
        .from('ai_chat_sessions' as 'announcements')
        .update({ title, updated_at: new Date().toISOString() } as never)
        .eq('id', sessionId) as unknown as { error: Error | null };

      if (updateError) throw updateError;

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title } : s
      ));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update title');
    }
  }, [currentSession]);

  const addMessage = useCallback(async (message: ChatMessage): Promise<ChatMessage[]> => {
    // If no current session, create one first
    let activeSession = currentSession;
    
    if (!activeSession) {
      if (!organizationId || !userId) {
        throw new Error('Organization or user not found');
      }

      const newSession: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'> = {
        organization_id: organizationId,
        user_id: userId,
        title: 'New Chat',
        messages: [],
      };

      const { data, error: insertError } = await supabase
        .from('ai_chat_sessions' as 'announcements')
        .insert(newSession as never)
        .select()
        .single() as unknown as { data: ChatSession; error: Error | null };

      if (insertError) throw insertError;

      activeSession = data;
      setSessions(prev => [data, ...prev]);
      setCurrentSession(data);
    }

    // Add message to the session
    const updatedMessages = [...activeSession.messages, message];
    
    // Update title if it's the first user message
    let title = activeSession.title;
    if (activeSession.title === 'New Chat' && message.role === 'user') {
      const firstWords = message.content.split(' ').slice(0, 4).join(' ');
      title = firstWords + (message.content.length > firstWords.length ? '...' : '');
    }

    // Update in database
    const { error: updateError } = await supabase
      .from('ai_chat_sessions' as 'announcements')
      .update({ 
        messages: updatedMessages, 
        title,
        updated_at: new Date().toISOString() 
      } as never)
      .eq('id', activeSession.id) as unknown as { error: Error | null };

    if (updateError) {
      console.error('Failed to save message:', updateError);
    }

    // Update local state immediately with the new message
    const updatedSession = { ...activeSession, messages: updatedMessages, title };
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => 
      s.id === activeSession!.id ? updatedSession : s
    ));
    
    return updatedMessages;
  }, [currentSession, organizationId, userId]);

  return {
    sessions,
    currentSession,
    loading,
    error,
    createSession,
    loadSession,
    deleteSession,
    updateTitle,
    addMessage,
    clearError,
  };
}
