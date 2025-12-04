import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ProfileHeader() {
  return (
    <div className="px-4 mb-4">
      <Link
        href="/community"
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
    </div>
  );
}
