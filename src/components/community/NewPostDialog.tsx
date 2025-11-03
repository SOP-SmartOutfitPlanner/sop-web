import { useState } from 'react';
import { ImageIcon, Smile, MapPin, Users, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface NewPostDialogProps {
  onCreatePost: (data: { caption: string; tags: string[]; image?: string }) => void;
}

export function NewPostDialog({ onCreatePost }: NewPostDialogProps) {
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    // Extract hashtags from caption
    const hashtags = caption.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];

    onCreatePost({
      caption: caption.trim(),
      tags: hashtags,
      image: selectedImage || undefined
    });

    setCaption('');
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <DialogHeader className="pb-4">
        <DialogTitle className="text-lg font-semibold text-center border-b pb-3">
          Create Post
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info Header */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/api/placeholder/40/40" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">User Name</div>
            <div className="text-xs text-muted-foreground">Public</div>
          </div>
        </div>

        {/* Text Input */}
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="min-h-[120px] border-0 resize-none text-lg placeholder:text-muted-foreground focus-visible:ring-0 p-0"
          style={{ fontSize: '16px' }}
        />

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="w-full rounded-lg max-h-96 object-cover" 
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border rounded-lg p-3">
          <div className="text-sm font-medium mb-2">Add to your post</div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors">
                <ImageIcon className="w-5 h-5 text-green-500" />
              </div>
            </label>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <Smile className="w-5 h-5 text-yellow-500" />
            </div>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!caption.trim()}
        >
          Post
        </Button>
      </form>
    </div>
  );
}

