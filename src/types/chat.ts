export interface UserMini {
  id: string;
  name: string;
  role?: 'user' | 'stylist' | 'admin';
  isOnline?: boolean;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: UserMini[];
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

