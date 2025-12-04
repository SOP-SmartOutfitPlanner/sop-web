"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { wardrobeAPI, WornHistoryItem } from "@/lib/api/wardrobe-api";
import GlassCard from "@/components/ui/glass-card";

interface ItemHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  itemName: string;
}

export function ItemHistoryDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
}: ItemHistoryDialogProps) {
  const [history, setHistory] = useState<WornHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(
    async (pageIndex: number, isNew: boolean = false) => {
      if (loading && !isNew) return; // Allow loading if it's a new fetch (reset)
      setLoading(true);
      try {
        const response = await wardrobeAPI.getWornHistory(
          itemId,
          pageIndex,
          10
        );
        if (isNew) {
          setHistory(response.data);
        } else {
          setHistory((prev) => [...prev, ...response.data]);
        }
        setHasMore(response.metaData.hasNext);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    },
    [itemId] // Removed loading from dependency to avoid stale closure issues if not careful, but logic inside handles it
  );

  useEffect(() => {
    if (open) {
      setPage(1);
      setHasMore(true);
      fetchHistory(1, true);
    }
  }, [open, itemId, fetchHistory]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      setPage((p) => {
        const nextPage = p + 1;
        fetchHistory(nextPage);
        return nextPage;
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="w-full max-w-md max-h-[80vh] flex flex-col relative z-10 overflow-hidden rounded-3xl shadow-2xl">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95">
          <div className="absolute top-0 -right-32 w-[300px] h-[300px] bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-32 w-[300px] h-[300px] bg-cyan-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-dela-gothic text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                Worn History
              </h3>
              <p className="font-bricolage text-sm text-gray-200 mt-0.5 truncate max-w-[200px]">
                {itemName}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar"
            onScroll={handleScroll}
          >
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-blue-200 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-medium text-white">
                    {new Date(item.wornAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-white/50 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.wornAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="py-4 flex justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && history.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/50">No history found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
