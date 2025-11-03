import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserMini } from '@/types/chat';

interface QuickChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  stylist: UserMini;
}

export function QuickChatModal({ isOpen, onClose, stylist }: QuickChatModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'stylist'; timestamp: Date }>>([
    {
      text: "Hi! Thanks for reaching out. How can I help you with your style today?",
      sender: 'stylist',
      timestamp: new Date()
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        text: message,
        sender: 'user',
        timestamp: new Date()
      }
    ]);
    setMessage('');

    // Simulate stylist response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          text: "That's a great question! Let me help you with that...",
          sender: 'stylist',
          timestamp: new Date()
        }
      ]);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                  {stylist.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-base font-semibold">{stylist.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Stylist</Badge>
                  {stylist.isOnline && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Online
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div className="space-y-4 max-h-96 overflow-y-auto py-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

