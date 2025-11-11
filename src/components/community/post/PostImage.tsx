import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PostImageProps {
  images: string[];
  onDoubleClick: () => void;
}

export function PostImage({ images, onDoubleClick }: PostImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const hasMultiple = images.length > 1;

  if (images.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300"
      style={{ height: "clamp(260px, 40vh, 520px)" }}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glass border effect */}
      <div className={`absolute inset-0 rounded-3xl pointer-events-none transition-all duration-300 ${
        isHovered
          ? "bg-gradient-to-br from-cyan-400/10 via-blue-400/5 to-indigo-400/10 border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
          : "bg-transparent border-2 border-cyan-400/15"
      }`} />

      {/* Background gradient - Dark and transparent */}
      <div className={`absolute inset-0 z-0 transition-all duration-300 ${
        isHovered
          ? "bg-slate-950/20"
          : "bg-slate-950/10"
      }`} />
      
      {/* Premium white glass overlay on hover */}
      <div className={`absolute inset-0 rounded-3xl backdrop-blur-sm pointer-events-none transition-all duration-300 z-[5] ${
        isHovered
          ? "bg-gradient-to-br from-white/20 via-blue-100/10 to-cyan-100/10"
          : "bg-transparent"
      }`} />
      
      <div className="relative w-full h-full z-10">
        <Image
          src={images[currentIndex]}
          alt={`Post image ${currentIndex + 1}`}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 680px"
          priority={false}
        />
      </div>

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500/60 to-blue-500/60 hover:from-cyan-500/80 hover:to-blue-500/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 backdrop-blur-sm border border-cyan-400/30 hover:border-cyan-400/50"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500/60 to-blue-500/60 hover:from-cyan-500/80 hover:to-blue-500/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 backdrop-blur-sm border border-cyan-400/30 hover:border-cyan-400/50"
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Image counter */}
      {hasMultiple && (
        <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/60 to-blue-500/60 text-white text-xs font-semibold backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/30">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Dot indicators */}
      {hasMultiple && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-cyan-400 w-2.5 h-2.5 shadow-lg shadow-cyan-500/40"
                  : "bg-white/30 w-2 h-2 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
