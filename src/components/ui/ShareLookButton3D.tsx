"use client";

import * as React from "react";
import { Plus } from "lucide-react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

const ShareLookButton3D = React.forwardRef<HTMLButtonElement, Props>(
  ({ label = "Share Look", className = "", disabled, ...props }, ref) => {
    return (
      <span className="relative inline-block [perspective:60rem]">
        <button
          ref={ref}
          type="button"
          aria-label={label}
          disabled={disabled}
          className={[
            "group relative isolate inline-flex items-center gap-2 rounded-2xl",
            "px-5 py-2.5 font-semibold text-white",
            "[transform-style:preserve-3d]",
            // motion & states
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "hover:[transform:translateZ(6px)_rotateX(3deg)_rotateY(-3deg)_translateY(-2px)]",
            "active:[transform:translateZ(2px)_rotateX(1deg)_rotateY(-1deg)_translateY(0)_scale(0.99)]",
            // accessibility
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
            // reduced motion
            "motion-reduce:transform-none motion-reduce:transition-none",
            // disabled
            disabled
              ? "opacity-60 cursor-not-allowed hover:transform-none active:transform-none"
              : "",
            className,
          ].join(" ")}
          {...props}
        >
          {/* BACK PLATE: gradient xanh đậm + ring tối nhẹ + bóng xa mềm */}
          <span
            aria-hidden="true"
            className={[
              "absolute inset-0 rounded-[1.15rem]",
              "bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900",
              "origin-[100%_100%] rotate-[4deg]",
              "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "group-hover:[transform:translate3d(-6px,-6px,6px)_rotate(7deg)]",
              "shadow-[0_10px_30px_rgba(2,6,23,0.28)]",
              "ring-1 ring-black/15",
              "motion-reduce:transform-none",
            ].join(" ")}
          />

          {/* FRONT GLASS: blur + ring trắng trong + inner highlight + chống banding */}
          <span
            aria-hidden="true"
            className={[
              "absolute inset-0 rounded-2xl",
              "bg-white/12 backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)]",
              "ring-1 ring-white/30",
              // inner highlights for crisp glass edge
              "shadow-[inset_0_0_0.5px_rgba(255,255,255,0.5),inset_0_-10px_24px_rgba(2,6,23,0.08)]",
              "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "group-hover:[transform:translateZ(9px)]",
              "motion-reduce:transform-none",
              // radial specular highlight (subtle)
              "before:absolute before:inset-0 before:rounded-2xl",
              "before:bg-[radial-gradient(120%_120%_at_30%_0%,rgba(255,255,255,0.18),rgba(255,255,255,0)_60%)]",
              "before:pointer-events-none",
              // ultra-light noise to break gradient banding
              "after:absolute after:inset-0 after:rounded-2xl after:opacity-[0.03]",
              "after:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><rect width=%2224%22 height=%2224%22 fill=%22%23fff%22 opacity=%220.04%22/></svg>')]",
              // outer glow on hover (very subtle)
              "group-hover:shadow-[0_0_24px_4px_rgba(37,99,235,0.15)]",
            ].join(" ")}
          />

          {/* CONTENT */}
          <span className="relative z-10 inline-flex items-center gap-2">
            <Plus className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
            <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
              {label}
            </span>
          </span>
        </button>
      </span>
    );
  }
);

ShareLookButton3D.displayName = "ShareLookButton3D";
export default ShareLookButton3D;
