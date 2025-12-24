import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, User, Loader2, BookOpen, GraduationCap, FileText, Award } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { buildProfileContext } from '@/lib/aiContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Простая очистка Markdown-символов из ответа ассистента
const sanitizeMarkdown = (text: string) => {
  return text
    // Блоки кода ```...```
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))
    // Инлайн-код `code`
    .replace(/`([^`]+)`/g, '$1')
    // Жирный/курсив **text** или *text*
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Подчёркивание __text__
    .replace(/__(.*?)__/g, '$1')
    // Заголовки #, ##, ###
    .replace(/^#{1,6}\s+/gm, '')
    // Изображения ![alt](url) — удаляем целиком
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Ссылки [text](url) — оставляем текст
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Маркеры списков -, *, + и нумерованные — заменяем на буллет
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '• ')
    // Блок‑цитаты >
    .replace(/^>\s?/gm, '')
    // Лишние пробелы в конце строк
    .replace(/[ \t]+\n/g, '\n');
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickPrompts = [
  { icon: GraduationCap, text: 'Как выбрать университет?' },
  { icon: BookOpen, text: 'Советы по подготовке к ЕГЭ' },
  { icon: FileText, text: 'Как написать мотивационное письмо?' },
  { icon: Award, text: 'Какие есть стипендии?' },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, session } = useAuth();

  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  useEffect(() => {
    if (user && currentSessionId) {
      loadChatHistory(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [user, currentSessionId]);

  const loadSessions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setSessions(data);
        if (data.length > 0 && !currentSessionId) {
          setCurrentSessionId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const createNewSession = async (firstMessage?: string) => {
    if (!user) return null;
    try {
      const title = firstMessage 
        ? (firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage)
        : 'Новый чат';
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSessions(prev => [data, ...prev]);
        setCurrentSessionId(data.id);
        return data.id;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setMessages(data.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    let profileContext: string | null = null;
    try {
      if (user?.id) {
        const ctx = await buildProfileContext(user.id);
        profileContext = ctx.summary;
      }
    } catch (err) {
      console.warn('Failed to build profile context:', err);
    }

    // Save user message
    const lastMessage = userMessages[userMessages.length - 1];
    
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      const newId = await createNewSession(lastMessage.content);
      if (newId) activeSessionId = newId;
    }

    if (user?.id && lastMessage.role === 'user' && activeSessionId) {
      supabase.from('chat_messages').insert({
        user_id: user.id,
        session_id: activeSessionId,
        role: 'user',
        content: lastMessage.content
      }).then(({ error }) => {
        if (error) {
          console.error('Failed to save user message:', error);
          toast.error('Не удалось сохранить сообщение. Пожалуйста, примените SQL-миграцию для чатов.');
        }
      });
    }

    const response = await fetch(`/api/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: userMessages, profileContext }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при отправке сообщения');
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: 'assistant', content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Save assistant message
    if (user?.id && assistantContent && activeSessionId) {
      supabase.from('chat_messages').insert({
        user_id: user.id,
        session_id: activeSessionId,
        role: 'assistant',
        content: assistantContent
      }).then(({ error }) => {
        if (error) console.error('Failed to save assistant message:', error);
      });
    }

    setIsLoading(false);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка');
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex gap-4 max-w-7xl mx-auto animate-fade-in">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 hidden md:flex flex-col gap-2 bg-card rounded-2xl border border-border p-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 mb-2"
            onClick={() => {
              setCurrentSessionId(null);
              setMessages([]);
            }}
          >
            <Sparkles className="w-4 h-4" />
            Новый чат
          </Button>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={cn(
                    "text-left px-3 py-2 rounded-md text-sm transition-colors truncate",
                    currentSessionId === session.id 
                      ? "bg-accent/10 text-accent font-medium" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {session.title}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">ИИ-консультант</h1>
              <p className="text-sm text-muted-foreground">Помощь с поступлением 24/7</p>
            </div>
          </div>

          {/* Chat box */}
          <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-3xl gradient-accent flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-accent-foreground" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">
                  Привет! Я твой ИИ-консультант
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Задай мне вопрос о поступлении, экзаменах, стипендиях или выборе университета
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(prompt.text)}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all text-left group"
                    >
                      <prompt.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-accent-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === 'user'
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите ваш вопрос..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                variant="hero"
                size="icon"
                className="h-11 w-11"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
