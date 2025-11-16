"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Globe2,
  Heart,
  Layers,
  Lock,
  MessageCircle,
  SquareStack,
} from "lucide-react";

import GlassCard from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { CollectionRecord } from "@/lib/api";
import {
  parseColorNames,
  getAuthorInitials,
  getCollectionThumbnail,
  getCollectionFallbackImages,
} from "@/lib/collections/utils";

interface CollectionCardProps {
  collection: CollectionRecord;
  canManage?: boolean;
}

export function CollectionCard({
  collection,
  canManage: _canManage = false,
}: CollectionCardProps) {
  const thumbnail = getCollectionThumbnail(collection);
  const outfitsCount = collection.outfits?.length ?? 0;
  const fallbackImages = getCollectionFallbackImages(collection);

  const publishedBadge = collection.isPublished
    ? {
        icon: <Globe2 className="h-3 w-3" />,
        label: "Published",
        className:
          "bg-emerald-500/25 text-emerald-50 border border-emerald-400/40",
      }
    : {
        icon: <Lock className="h-3 w-3" />,
        label: "Draft",
        className: "bg-slate-800/50 text-slate-100 border border-slate-600/40",
      };

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      aria-label={`Open collection ${collection.title}`}
    >
      <GlassCard
        padding="1.5rem"
        blur="18px"
        glowColor="rgba(94, 234, 212, 0.35)"
        glowIntensity={18}
        shadowColor="rgba(15, 23, 42, 0.55)"
        className={cn(
          "relative h-full w-full flex-col gap-5 border border-cyan-500/15 bg-slate-950/45 transition-all duration-500 ease-out",
          "group-hover:-translate-y-2 group-hover:border-cyan-400/40 group-hover:shadow-[0_28px_60px_-28px_rgba(56,189,248,0.55)]"
        )}
      >
        <div className="flex w-full flex-col gap-5">
          <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/60">
            <div className="relative aspect-[4/3] w-full">
              {thumbnail ? (
                <>
                  <Image
                    src={thumbnail}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/35 to-transparent" />
                </>
              ) : fallbackImages.length > 0 ? (
                <div className="grid h-full w-full grid-cols-2 grid-rows-2">
                  {fallbackImages.map((image, index) => (
                    <div key={image} className="relative">
                      <Image
                        src={image}
                        alt={`${collection.title} preview ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ))}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),rgba(14,116,144,0.4),rgba(15,23,42,0.9))]">
                  <SquareStack className="h-12 w-12 text-cyan-300/60" />
                </div>
              )}
            </div>

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/60 via-transparent to-transparent" />
            </div>

            <div className="absolute left-4 top-4">
              <Badge
                className={cn(
                  "gap-1 rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur-md",
                  publishedBadge.className
                )}
              >
                {publishedBadge.icon}
                {publishedBadge.label}
              </Badge>
            </div>

            {outfitsCount > 0 && (
              <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                <Layers className="h-3.5 w-3.5 text-cyan-200" />
                {outfitsCount}
              </div>
            )}
          </div>

          <header className="flex flex-col gap-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-cyan-100 md:text-[26px]">
                {collection.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-300 line-clamp-2">
                {collection.shortDescription}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm">
                <Avatar className="h-10 w-10 border border-white/20 bg-slate-800/80">
                  {collection.avtUrl && (
                    <AvatarImage
                      src={collection.avtUrl}
                      alt={collection.userDisplayName}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-cyan-500/25 text-sm font-semibold uppercase tracking-wide text-white">
                    {getAuthorInitials(collection.userDisplayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-white">
                    {collection.userDisplayName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-5 text-sm text-white/85">
                <span className="inline-flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-300" />
                  {collection.likeCount}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-cyan-200" />
                  {collection.commentCount}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Bookmark
                    className={cn(
                      "h-5 w-5 transition-colors",
                      collection.isSaved ? "text-amber-200" : "text-slate-300"
                    )}
                  />
                  {collection.savedCount ?? 0}
                </span>
              </div>
            </div>
          </header>
        </div>
      </GlassCard>
    </Link>
  );
}
