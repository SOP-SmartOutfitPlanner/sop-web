interface HelpTextProps {
  text: string;
  highlight?: string;
}

export function HelpText({ text, highlight = "Note:" }: HelpTextProps) {
  return (
    <div className="mt-6 p-4 bg-login-white-gray/30 rounded-lg border border-gray-200/50">
      <p className="text-xs text-login-gray text-center">
        💡 <span className="font-medium">{highlight}</span> {text}
      </p>
    </div>
  );
}
