"use client";

import GlassCard from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyPulseChart } from "../components/MonthlyPulseChart";
import {
  StylistPostHighlight,
  StylistPostsMonthlyStat,
  StylistPostsStats,
} from "@/lib/api";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate, formatNumber, stripHtml } from "../utils";

interface CommunityTabProps {
  isLoading: boolean;
  postsStats?: StylistPostsStats;
  postsActivityLabel: string;
}

export function CommunityTab({
  isLoading,
  postsStats,
  postsActivityLabel,
}: CommunityTabProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-3xl bg-white/10" />
        ))}
      </div>
    );
  }

  return (
    <>
      <section className="grid gap-6 md:grid-cols-2">
        <MonthlyPulseChart
          title="Posts monthly pulse"
          icon={<FileText className="h-5 w-5 text-sky-400" />}
          stats={postsStats?.monthlyStats}
          emptyMessage="No posts were published during this time range."
          extraLabel="📝 Posts:"
          color={{
            stroke: "#c084fc",
            gradientFrom: "rgba(192, 132, 252, 0.9)",
            gradientTo: "rgba(192, 132, 252, 0.1)",
          }}
          mapExtra={(stat) => (stat as StylistPostsMonthlyStat).postsCreated}
        />
        <GlassCard
          padding="1.75rem"
          blur="16px"
          glowColor="rgba(110, 231, 183, 0.2)"
          className="border border-white/10 bg-slate-950/60 text-white"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Quick insight
          </p>
          <h3 className="mt-2 text-3xl font-semibold">{postsActivityLabel}</h3>
          <p className="mt-2 text-sm text-white/70">
            Followers gained this period:{" "}
            {formatNumber(postsStats?.followersThisMonth)}
          </p>
        </GlassCard>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">
              Top community posts
            </h3>
            <p className="text-sm text-white/70">
              Posts with the highest engagement this cycle.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:border-white hover:bg-white/10"
            asChild
          >
            <Link href="/community">Review community posts</Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {(postsStats?.topPosts ?? []).length === 0 && (
            <GlassCard
              padding="2rem"
              blur="12px"
              className="border border-dashed border-white/20 bg-transparent text-center text-white"
            >
              <p>No high-performing posts yet.</p>
              <p className="text-sm text-white/70">
                Share styling tips and behind-the-scenes looks to drive engagement.
              </p>
            </GlassCard>
          )}
          {(postsStats?.topPosts ?? []).map((post: StylistPostHighlight) => (
            <GlassCard
              key={post.id}
              padding="1.5rem"
              blur="14px"
              className="border border-white/10 bg-slate-900/70 text-white"
            >
              <div className="space-y-3">
                {post.images?.length > 0 && (
                  <div className="overflow-hidden rounded-2xl">
                    <div
                      className="h-44 w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${post.images[0]})`,
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Post #{post.id}</span>
                  <span>{formatDate(post.createdDate)}</span>
                </div>
                <p className="text-sm text-white/90 line-clamp-3">
                  {stripHtml(post.body ?? "")}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/80">
                  <div className="rounded-xl bg-white/5 p-2">
                    <p className="font-semibold">{post.likeCount}</p>
                    <p>Likes</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2">
                    <p className="font-semibold">{post.commentCount}</p>
                    <p>Comments</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2">
                    <p className="font-semibold">{post.totalEngagement}</p>
                    <p>Engagement</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </>
  );
}

