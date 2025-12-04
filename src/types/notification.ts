export interface Notification {
  id: number;
  title: string;
  message: string;
  href: string | null;
  imageUrl: string | null;
  createdAt: string;
}