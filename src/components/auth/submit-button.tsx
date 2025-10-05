import { Button } from "@/components/ui/button";
import type { AuthFormType } from "@/lib/types";

interface SubmitButtonProps {
  isLoading: boolean;
  type: AuthFormType;
}

export function SubmitButton({ isLoading, type }: SubmitButtonProps) {
  return (
    <Button className="w-full" type="submit" disabled={isLoading}>
      {isLoading ? (
        <div className="h-4 w-4 animate-spin" />
      ) : type === "login" ? (
        "Đăng nhập"
      ) : (
        "Đăng ký"
      )}
    </Button>
  );
}
