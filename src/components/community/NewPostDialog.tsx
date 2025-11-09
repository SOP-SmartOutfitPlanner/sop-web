import { PostFormDialog } from "./PostFormDialog";

interface NewPostDialogProps {
  onCreatePost: (data: {
    caption: string;
    tags: string[];
    files?: File[];
  }) => void;
  isSubmitting?: boolean;
}

export function NewPostDialog({
  onCreatePost,
  isSubmitting = false,
}: NewPostDialogProps) {
  return (
    <PostFormDialog
      mode="create"
      onSubmit={onCreatePost}
      isSubmitting={isSubmitting}
    />
  );
}
