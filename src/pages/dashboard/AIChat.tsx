import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, User, Loader2, BookOpen, GraduationCap, FileText, Award } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
    // Ссылки [text](url) — оставляем текст
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
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
      <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex flex-col max-w-4xl mx-auto animate-fade-in">
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

        {/* Chat area */}
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
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.role === 'assistant' ? sanitizeMarkdown(message.content) : message.content}
                      </p>
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
    </DashboardLayout>
  );
}
