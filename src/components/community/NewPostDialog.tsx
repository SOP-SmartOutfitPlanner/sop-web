import { PostFormDialog } from "./PostFormDialog";

interface SharePostData {
  imageUrl: string | null;
  caption: string;
  outfitId?: number;
  itemIds?: number[];
}

interface NewPostDialogProps {
  isOpen?: boolean;
  onCreatePost: (data: {
    caption: string;
    captionHtml: string;
    tags: string[];
    files?: File[];
    itemIds?: number[];
    outfitId?: number;
  }) => void | Promise<void | boolean>;
  isSubmitting?: boolean;
  initialShareData?: SharePostData | null;
}

export function NewPostDialog({
  isOpen = true,
  onCreatePost,
  isSubmitting = false,
  initialShareData,
}: NewPostDialogProps) {
  return (
    <PostFormDialog
      mode="create"
      isOpen={isOpen}
      onSubmit={onCreatePost}
      isSubmitting={isSubmitting}
      initialShareData={initialShareData}
    />
  );
}
