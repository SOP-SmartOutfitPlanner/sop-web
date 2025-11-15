"use client";

export function ModalFooter() {
  return (
    <div className="px-10 pb-8 pt-6 shrink-0 border-t border-white/10 bg-white/5">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <p className="font-poppins text-white/60 font-medium mb-2">
            💡 Click an occasion to expand and see/add outfits
          </p>
          <div className="flex items-center gap-3 text-xs text-white/40 font-poppins">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                N
              </kbd>
              new occasion
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                ESC
              </kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
