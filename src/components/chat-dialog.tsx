
"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import type { Connection, UserProfile, ChatMessage } from '@/types';
import { getMessages, sendMessage } from '@/services/chatService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatDialogProps {
  connection: Connection;
  userProfile: UserProfile;
  buddyProfile: UserProfile;
  onClose: () => void;
}

export function ChatDialog({ connection, userProfile, buddyProfile, onClose }: ChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = getMessages(connection.id, (loadedMessages) => {
      setMessages(loadedMessages);
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [connection.id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    const textToSend = newMessage;
    setNewMessage(''); // Clear input optimistically
    
    await sendMessage(connection.id, userProfile.uid, textToSend);
    setIsLoading(false);
  };
  
  const formatTimestamp = (timestamp: ChatMessage['timestamp']) => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp.seconds * 1000);
        return format(date, 'p');
    } catch {
        return '';
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-3">
             <Avatar>
                <AvatarImage src={`https://placehold.co/40x40.png`} alt={buddyProfile.name} data-ai-hint="person face" />
                <AvatarFallback>{buddyProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            {buddyProfile.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[450px] p-4" ref={scrollAreaRef}>
          <div className="space-y-6 pr-4">
            {messages.map((msg) => {
              const isCurrentUser = msg.senderId === userProfile.uid;
              return (
                <div key={msg.id} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                  {!isCurrentUser && (
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://placehold.co/40x40.png`} alt={buddyProfile.name} data-ai-hint="person face"/>
                        <AvatarFallback>{buddyProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("p-3 rounded-lg max-w-[80%]", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={cn("text-xs opacity-70 mt-1", isCurrentUser ? "text-right" : "text-left")}>{formatTimestamp(msg.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              autoComplete="off"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
