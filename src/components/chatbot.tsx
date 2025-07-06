"use client";

import { useState, useRef, useEffect, useOptimistic } from 'react';
import { chatbotAssistant } from '@/ai/flows/chatbot-assistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  isOptimistic?: boolean;
};

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<Message[], string>(
    messages,
    (state: Message[], newMessage: string) => [
      ...state,
      { id: Date.now(), role: 'user', text: newMessage, isOptimistic: true },
    ]
  );
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [optimisticMessages]);

  const handleSubmit = async (formData: FormData) => {
    const query = formData.get('query') as string;
    if (!query) return;

    formRef.current?.reset();
    addOptimisticMessage(query);
    setIsLoading(true);

    try {
      const { response } = await chatbotAssistant({ query });
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'user', text: query },
        { id: Date.now() + 1, role: 'assistant', text: response }
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'user', text: query },
        { id: Date.now() + 1, role: 'assistant', text: "Sorry, I'm having trouble connecting. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[450px]">
      <ScrollArea className="flex-grow p-4 border rounded-t-lg" ref={scrollAreaRef}>
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
            </Avatar>
            <div className="bg-muted p-3 rounded-lg max-w-[80%]">
              <p className="text-sm">Hi there! Ask me anything about the campus, like "Where is Hostel Block B?" or "What's the WiFi password?".</p>
            </div>
          </div>
          {optimisticMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start',
                message.isOptimistic && "opacity-50"
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn("p-3 rounded-lg max-w-[80%]", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="text-sm">{message.text}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form ref={formRef} action={handleSubmit} className="flex items-center gap-2 p-2 border-t border-x border-b rounded-b-lg bg-background">
        <Input
          name="query"
          placeholder="Ask a question..."
          className="flex-grow"
          disabled={isLoading}
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
