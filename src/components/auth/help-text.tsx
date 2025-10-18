interface HelpTextProps {
  text: string;
  highlight?: string;
}

export function HelpText({ text, highlight = "Lưu ý:" }: HelpTextProps) {
  return (
    <div className="mt-6 p-4 bg-login-light-gray/30 rounded-lg border border-gray-200/50">
      <p className="text-xs text-login-gray text-center">
        💡 <span className="font-medium">{highlight}</span> {text}
      </p>
    </div>
  );
}

