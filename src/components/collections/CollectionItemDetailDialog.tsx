"use client";

import { useMemo } from "react";
import { Image as AntdImage } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Shirt, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CollectionItemDetail } from "@/lib/api";
import { wardrobeAPI } from "@/lib/api";
import type { ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import {
  parseColorNames,
  formatDate as formatCollectionDate,
} from "@/lib/collections/utils";
import { useScrollLock } from "@/hooks/useScrollLock";
import { parseColors } from "@/lib/utils/color-utils";

interface CollectionItemDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number | null;
  initialItem?: CollectionItemDetail | null;
}

type DetailSource =
  | (CollectionItemDetail & { id?: number })
  | (ApiWardrobeItem & { itemId?: number });

function isWardrobeItem(
  detail: DetailSource
): detail is ApiWardrobeItem & { itemId?: number } {
  return "userId" in detail || "category" in detail || "styles" in detail;
}

function normalizeDetail(detail?: DetailSource | null) {
  if (!detail) return null;

  const isApiItem = isWardrobeItem(detail);
  const categoryName =
    detail.categoryName ??
    (isApiItem ? detail.category?.name : undefined) ??
    (detail.categoryId ? `Category #${detail.categoryId}` : undefined);

  const colorLabel =
    parseColorNames(detail.color ?? null) ?? detail.color ?? undefined;
  const colorRaw = detail.color ?? undefined;

  return {
    id: detail.itemId ?? (isApiItem ? detail.id : undefined),
    name: detail.name,
    categoryName,
    brand: detail.brand ?? undefined,
    aiDescription: detail.aiDescription ?? undefined,
    colorLabel,
    colorRaw,
    weather: detail.weatherSuitable ?? undefined,
    pattern: detail.pattern ?? undefined,
    fabric: detail.fabric ?? undefined,
    condition: detail.condition ?? undefined,
    frequency: detail.frequencyWorn ?? undefined,
    lastWornAt: detail.lastWornAt ?? undefined,
    imageUrl: detail.imgUrl ?? undefined,
    styles: isApiItem
      ? detail.styles?.map((style) => style.name).filter(Boolean)
      : undefined,
    occasions: isApiItem
      ? detail.occasions?.map((occasion) => occasion.name).filter(Boolean)
      : undefined,
    seasons: isApiItem
      ? detail.seasons?.map((season) => season.name).filter(Boolean)
      : undefined,
  };
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[320px,1fr]">
        <Skeleton className="aspect-square rounded-2xl bg-slate-800/60" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3 bg-slate-800/60" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-3 w-16 bg-slate-800/60" />
                <Skeleton className="h-5 w-24 bg-slate-800/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Skeleton className="h-24 w-full bg-slate-800/60" />
    </div>
  );
}

export function CollectionItemDetailDialog({
  open,
  onOpenChange,
  itemId,
  initialItem,
}: CollectionItemDetailDialogProps) {
  useScrollLock(open);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collection-item-detail", itemId],
    queryFn: async () => {
      if (!itemId) return null;
      const response = await wardrobeAPI.getItem(itemId);
      // Some endpoints still wrap payload under data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response as any)?.data ?? response;
    },
    enabled: open && !!itemId,
    staleTime: 60 * 1000,
  });

  const normalized = useMemo(
    () => normalizeDetail((data as DetailSource | null) ?? initialItem ?? null),
    [data, initialItem]
  );

  const lastWorn =
    normalized?.lastWornAt && normalized.lastWornAt !== "string"
      ? formatCollectionDate(normalized.lastWornAt, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : undefined;

  const infoRows = normalized
    ? [
        { label: "Category", value: normalized.categoryName },
        { label: "Brand", value: normalized.brand },
        { label: "Condition", value: normalized.condition },
        { label: "Fabric", value: normalized.fabric },
        { label: "Pattern", value: normalized.pattern },
        { label: "Weather", value: normalized.weather },
        { label: "Worn", value: normalized.frequency },
        { label: "Last worn", value: lastWorn },
      ].filter((row) => Boolean(row.value))
    : [];

  const colorSwatches = useMemo(() => {
    if (!normalized?.colorRaw) return [];
    return parseColors(normalized.colorRaw);
  }, [normalized?.colorRaw]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-5xl sm:max-w-5xl md:max-w-5xl border border-cyan-500/10 bg-gradient-to-br from-slate-950/20 via-slate-900/25 to-slate-950/35 backdrop-blur-2xl shadow-[0_30px_90px_rgba(2,6,23,0.7)]">
        {!normalized && isLoading ? (
          <DetailSkeleton />
        ) : isError ? (
          <div className="py-12 text-center text-sm text-red-400">
            Unable to load item details. Please try again later.
          </div>
        ) : normalized ? (
          <div className="flex h-full flex-col gap-6">
            <DialogHeader className="pb-0">
              <DialogTitle className="font-bricolage text-2xl text-white">
                {normalized.name}
              </DialogTitle>
              {normalized.categoryName && (
                <DialogDescription className="text-sm text-slate-400">
                  {normalized.categoryName}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              <div className="md:w-1/2 md:shrink-0 md:sticky md:top-6">
                <div className="aspect-square rounded-xl overflow-hidden bg-white/5 relative ">
                  {normalized.imageUrl ? (
                    <AntdImage
                      src={normalized.imageUrl}
                      alt={normalized.name}
                      className="w-full h-full object-cover cursor-zoom-in"
                      preview={{
                        mask: (
                          <div className="text-xs uppercase tracking-[0.3em] text-white">
                            Preview
                          </div>
                        ),
                      }}
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                        cursor: "zoom-in",
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-cyan-300/70">
                      <Shirt className="h-12 w-12" />
                      <span className="text-xs uppercase tracking-widest">
                        No Image
                      </span>
                    </div>
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
                      <Sparkles className="h-5 w-5 animate-spin text-cyan-300" />
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-1/2 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {infoRows.map((row) => (
                    <div key={row.label} className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        {row.label}
                      </p>
                      <p className="font-semibold text-white">
                        {row.value as string}
                      </p>
                    </div>
                  ))}
                </div>

                {(colorSwatches.length > 0 || normalized.colorLabel) && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Color palette
                    </p>
                    {colorSwatches.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {colorSwatches.map(({ name, hex }, index) => (
                          <div
                            key={`${name}-${hex}-${index}`}
                            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-white/20"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-xs font-medium text-slate-100">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-white">
                        {normalized.colorLabel}
                      </p>
                    )}
                  </div>
                )}

                {(normalized.styles?.length ||
                  normalized.occasions?.length ||
                  normalized.seasons?.length) && (
                  <div className="space-y-3 text-sm">
                    {normalized.styles?.length ? (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                          Styles
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {normalized.styles.map((style) => (
                            <Badge
                              key={style}
                              className="border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
                            >
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {normalized.occasions?.length ? (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                          Occasions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {normalized.occasions.map((occasion) => (
                            <Badge
                              key={occasion}
                              className="border-amber-400/30 bg-amber-500/10 text-amber-100"
                            >
                              {occasion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {normalized.seasons?.length ? (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                          Seasons
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {normalized.seasons.map((season) => (
                            <Badge
                              key={season}
                              className="border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                            >
                              {season}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-slate-400">
            Không tìm thấy thông tin item.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
