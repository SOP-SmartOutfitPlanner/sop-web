"use client";

import { useEffect, useRef } from "react";
import ImageEditor from "tui-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";
import { toast } from "sonner";

interface TuiImageEditorProps {
  open: boolean;
  imageUrl: string;
  onComplete: (file: File) => void;
  onCancel: () => void;
}

export function TuiImageEditor({
  open,
  imageUrl,
  onComplete,
  onCancel,
}: TuiImageEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ImageEditor | null>(null);

  useEffect(() => {
    if (!open || !imageUrl || !editorRef.current) return;

    // Clean up previous instance
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }

    // Create new editor instance
    const editor = new ImageEditor(editorRef.current, {
      includeUI: {
        loadImage: {
          path: imageUrl,
          name: "EditImage",
        },
        theme: {
          "common.bi.image": "",
          "common.bisize.width": "0px",
          "common.bisize.height": "0px",
          "common.backgroundImage": "none",
          "common.backgroundColor": "#1e1e1e",
          "common.border": "0px",
          "header.backgroundImage": "none",
          "header.backgroundColor": "#2d3748",
          "header.border": "0px",
          "loadButton.backgroundColor": "#3b82f6",
          "loadButton.border": "1px solid #3b82f6",
          "loadButton.color": "#fff",
          "loadButton.fontFamily": "Arial, sans-serif",
          "loadButton.fontSize": "12px",
          "downloadButton.backgroundColor": "#10b981",
          "downloadButton.border": "1px solid #10b981",
          "downloadButton.color": "#fff",
          "downloadButton.fontFamily": "Arial, sans-serif",
          "downloadButton.fontSize": "12px",
          "submenu.backgroundColor": "#2d3748",
          "submenu.partition.color": "#3f3f3f",
          "submenu.normalIcon.color": "#8b949e",
          "submenu.normalLabel.color": "#e9ecef",
          "submenu.activeIcon.color": "#3b82f6",
          "submenu.activeLabel.color": "#fff",
          "checkbox.border": "1px solid #ccc",
          "checkbox.backgroundColor": "#fff",
          "range.pointer.color": "#3b82f6",
          "range.bar.color": "#666",
          "range.subbar.color": "#3b82f6",
          "range.disabledPointer.color": "#434343",
          "range.disabledBar.color": "#282828",
          "range.disabledSubbar.color": "#434343",
          "colorpicker.button.border": "1px solid #1e1e1e",
          "colorpicker.title.color": "#fff",
        } as Record<string, string>,
        menu: ["crop", "flip", "rotate", "draw", "shape", "icon", "text", "filter"],
        initMenu: "crop",
        uiSize: {
          width: "100%",
          height: "100%",
        },
        menuBarPosition: "bottom",
        usageStatistics: false,
      },
      usageStatistics: false,
      cssMaxWidth: 2048,
      cssMaxHeight: 2048,
      selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70,
      },
    });

    instanceRef.current = editor;

    // Hide Load and Download buttons
    const hideButtons = () => {
      // Try multiple possible selectors
      const selectors = [
        '.tui-image-editor-load-btn',
        '.tui-image-editor-download-btn',
        'button[title="Load"]',
        'button[title="Download"]',
        '.tie-btn-load',
        '.tie-btn-download',
        '[data-action="load"]',
        '[data-action="download"]'
      ];

      selectors.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
          (button as HTMLElement).style.display = 'none';
        });
      });

      // Also hide by button text content
      const headerButtons = document.querySelectorAll('.tui-image-editor-header-buttons button');
      headerButtons.forEach(button => {
        const text = button.textContent?.toLowerCase() || '';
        if (text.includes('load') || text.includes('download')) {
          (button as HTMLElement).style.display = 'none';
        }
      });
    };

    // Call multiple times to ensure buttons are hidden
    hideButtons();
    setTimeout(hideButtons, 100);
    setTimeout(hideButtons, 300);
    setTimeout(hideButtons, 500);

    // Function to resize canvas to fit viewport
    const resizeCanvasToFit = () => {
      if (!instanceRef.current || !editorRef.current) return;

      const canvasSize = instanceRef.current.getCanvasSize();
      const container = editorRef.current;

      console.log("Canvas size:", canvasSize);
      console.log("Container size:", container.clientWidth, container.clientHeight);

      if (canvasSize.width && canvasSize.height && canvasSize.width > 0 && canvasSize.height > 0) {
        // Get container dimensions (accounting for UI elements)
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight - 150; // Account for header + bottom menu

        // Calculate scale to fit image in viewport
        const scaleX = containerWidth / canvasSize.width;
        const scaleY = containerHeight / canvasSize.height;
        const scale = Math.min(scaleX, scaleY, 0.9); // Use 0.9 to add some padding

        console.log("Scale factors:", { scaleX, scaleY, finalScale: scale });

        if (scale < 1) {
          // Only resize if image is larger than viewport
          const newWidth = Math.floor(canvasSize.width * scale);
          const newHeight = Math.floor(canvasSize.height * scale);

          console.log("Resizing to:", newWidth, newHeight);

          instanceRef.current.ui.resizeEditor({
            imageSize: {
              oldWidth: canvasSize.width,
              oldHeight: canvasSize.height,
              newWidth: newWidth,
              newHeight: newHeight,
            },
          });
        }
      }
    };

    // Wait for image to load with multiple attempts
    let attempts = 0;
    const maxAttempts = 10;
    const resizeInterval = setInterval(() => {
      attempts++;
      const canvasSize = instanceRef.current?.getCanvasSize();

      // Check if canvas has valid dimensions
      if (canvasSize && canvasSize.width > 0 && canvasSize.height > 0) {
        clearInterval(resizeInterval);
        resizeCanvasToFit();
      } else if (attempts >= maxAttempts) {
        clearInterval(resizeInterval);
        console.warn("Failed to get valid canvas size after", maxAttempts, "attempts");
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      clearInterval(resizeInterval);
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, [open, imageUrl]);

  const handleSave = async () => {
    if (!instanceRef.current) {
      toast.error("Editor not initialized");
      return;
    }

    const loadingToast = toast.loading("Saving changes...");

    try {
      const dataUrl = instanceRef.current.toDataURL();

      if (!dataUrl) {
        toast.error("Failed to generate image", { id: loadingToast });
        return;
      }

      // Convert data URL to File
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "edited-image.png", { type: "image/png" });

      toast.success("Image updated successfully!", { id: loadingToast });
      onComplete(file);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Failed to save image changes", { id: loadingToast });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Custom CSS to hide TUI logo and buttons */}
      <style jsx global>{`
        /* Hide logo and header buttons */
        .tui-image-editor-header-logo,
        .tui-image-editor-header-buttons {
          display: none !important;
        }

        /* Center submenu content only when visible */
        .tui-image-editor-submenu {
          text-align: center !important;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 pointer-events-none">
        <div
          className="w-[50vw] h-[90vh] max-w-[70vw] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Full Background Container with Glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-br bg-opacity-70 from-slate-900/50 via-blue-900/90 to-slate-900/50">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 -right-32 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Custom Header */}
            <div className="px-6 py-3 flex items-center justify-between flex-shrink-0">
              <h2 className="font-dela-gothic text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                Edit Image
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-bricolage font-medium transition-all duration-200 border border-white/30"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/60 to-cyan-500/60 hover:from-blue-600/70 hover:to-cyan-600/70 backdrop-blur-sm text-white rounded-lg font-bricolage font-semibold shadow-lg transition-all duration-200 border border-blue-400/50"
                >
                  Apply Changes
                </button>
              </div>
            </div>

            {/* Editor Container */}
            <div ref={editorRef} className="flex-1 w-full min-h-0" />
          </div>
        </div>
      </div>
    </>
  );
}
