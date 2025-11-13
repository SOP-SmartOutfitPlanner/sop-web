import { PostFormDialog } from "./PostFormDialog";

interface NewPostDialogProps {
  isOpen?: boolean;
  onCreatePost: (data: {
    caption: string;
    tags: string[];
    files?: File[];
  }) => void;
  isSubmitting?: boolean;
}

export function NewPostDialog({
  isOpen = true,
  onCreatePost,
  isSubmitting = false,
}: NewPostDialogProps) {
  return (
    <PostFormDialog
      mode="create"
      isOpen={isOpen}
      onSubmit={onCreatePost}
      isSubmitting={isSubmitting}
    />
  );
}
