"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      offset="16px"
      gap={12}
      toastOptions={{
        classNames: {
          toast: "glass-toast",
          description: "text-gray-300 text-sm mt-1",
          title: "text-white font-semibold text-base",
          actionButton:
            "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-cyan-500/30 transition-colors",
          cancelButton:
            "bg-slate-800/40 text-gray-300 border border-slate-600/30 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-800/60 transition-colors",
          closeButton:
            "text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors",
          icon: "text-cyan-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
