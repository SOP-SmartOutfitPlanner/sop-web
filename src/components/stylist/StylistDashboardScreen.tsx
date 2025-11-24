"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  stylistAPI,
  StylistCollectionsMonthlyStat,
  StylistPostsMonthlyStat,
} from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  FileText,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CreateCollectionDialog } from "@/components/collections/CreateCollectionDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COLLECTION_QUERY_KEYS } from "@/lib/collections/constants";
import { formatNumber } from "@/components/stylist/utils";
import { OverviewTab } from "@/components/stylist/sections/OverviewTab";
import { CollectionsTab } from "@/components/stylist/sections/CollectionsTab";
import { CommunityTab } from "@/components/stylist/sections/CommunityTab";
import { StatCardConfig } from "@/components/stylist/types";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEAR_RANGE = 4;

const yearOptions = Array.from({ length: YEAR_RANGE }, (_, index) => ({
  label: `${CURRENT_YEAR - index}`,
  value: CURRENT_YEAR - index,
}));

const monthOptions = [
  { label: "All year", value: "all" },
  ...Array.from({ length: 12 }, (_, index) => {
    const date = new Date(2000, index, 1);
    return {
      label: date.toLocaleString("en", { month: "long" }),
      value: `${index + 1}`,
    };
  }),
];

interface DashboardFilters {
  year: number;
  month?: number;
  topCollectionsCount: number;
  topPostsCount: number;
}

export function StylistDashboardScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = useMemo(
    () => (user?.id ? parseInt(user.id, 10) : null),
    [user?.id]
  );
  const [filters, setFilters] = useState<DashboardFilters>({
    year: CURRENT_YEAR,
    month: CURRENT_MONTH,
    topCollectionsCount: 5,
    topPostsCount: 5,
  });
  const [activeTab, setActiveTab] = useState<
    "overview" | "collections" | "community"
  >("overview");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const isStylist = useMemo(
    () => user?.role?.toUpperCase() === "STYLIST",
    [user?.role]
  );

  const collectionsStatsQuery = useQuery({
    queryKey: [
      "stylist-dashboard",
      "collections",
      filters.year,
      filters.month ?? "all",
      filters.topCollectionsCount,
    ],
    queryFn: () =>
      stylistAPI.getCollectionsStats({
        year: filters.year,
        month: filters.month,
        topCollectionsCount: filters.topCollectionsCount,
      }),
    enabled: isStylist,
    staleTime: 60 * 1000,
  });

  const postsStatsQuery = useQuery({
    queryKey: [
      "stylist-dashboard",
      "posts",
      filters.year,
      filters.month ?? "all",
      filters.topPostsCount,
    ],
    queryFn: () =>
      stylistAPI.getPostsStats({
        year: filters.year,
        month: filters.month,
        topPostsCount: filters.topPostsCount,
      }),
    enabled: isStylist,
    staleTime: 60 * 1000,
  });

  const isLoading =
    collectionsStatsQuery.isLoading || postsStatsQuery.isLoading;

  const hasError = collectionsStatsQuery.isError || postsStatsQuery.isError;

  const collectionsStats = collectionsStatsQuery.data;
  const postsStats = postsStatsQuery.data;

  const latestCollectionsPulse = useMemo(() => {
    if (!collectionsStats?.monthlyStats?.length) return null;
    if (filters.month) {
      return (
        collectionsStats.monthlyStats.find(
          (stat: StylistCollectionsMonthlyStat) => stat.month === filters.month
        ) ?? null
      );
    }
    return collectionsStats.monthlyStats.at(-1) ?? null;
  }, [collectionsStats?.monthlyStats, filters.month]);

  const latestPostsPulse = useMemo(() => {
    if (!postsStats?.monthlyStats?.length) return null;
    if (filters.month) {
      return (
        postsStats.monthlyStats.find(
          (stat: StylistPostsMonthlyStat) => stat.month === filters.month
        ) ?? null
      );
    }
    return postsStats.monthlyStats.at(-1) ?? null;
  }, [postsStats?.monthlyStats, filters.month]);

  const totalCollectionEngagement =
    (collectionsStats?.totalLikes ?? 0) +
    (collectionsStats?.totalComments ?? 0) +
    (collectionsStats?.totalSaves ?? 0);
  const totalPostEngagement =
    (postsStats?.totalLikes ?? 0) + (postsStats?.totalComments ?? 0);
  const maxEngagement = Math.max(
    totalCollectionEngagement,
    totalPostEngagement,
    1
  );
  const collectionEngagementPercent = Math.round(
    (totalCollectionEngagement / maxEngagement) * 100
  );
  const postEngagementPercent = Math.round(
    (totalPostEngagement / maxEngagement) * 100
  );

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    collectionsStatsQuery.refetch();
    queryClient.invalidateQueries({
      queryKey: ["stylist-dashboard", "collections"],
    });
    queryClient.invalidateQueries({
      queryKey: COLLECTION_QUERY_KEYS.collections,
    });
    if (userId) {
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.userCollections(userId),
      });
    }
  };

  const collectionsActivityLabel = useMemo(() => {
    if (!latestCollectionsPulse) {
      return "No collection activity logged for this selection.";
    }

    const base = `${latestCollectionsPulse.collectionsCreated} collections published`;
    return filters.month
      ? `${base} in ${latestCollectionsPulse.monthName}`
      : `Most recent activity (${latestCollectionsPulse.monthName}): ${base}`;
  }, [filters.month, latestCollectionsPulse]);

  const postsActivityLabel = useMemo(() => {
    if (!latestPostsPulse) {
      return "No post activity logged for this selection.";
    }

    const base = `${latestPostsPulse.postsCreated} posts shared`;
    return filters.month
      ? `${base} in ${latestPostsPulse.monthName}`
      : `Most recent activity (${latestPostsPulse.monthName}): ${base}`;
  }, [filters.month, latestPostsPulse]);

  useEffect(() => {
    if (collectionsStatsQuery.isSuccess) {
      console.log("[StylistDashboard] Collections stats", {
        filters,
        data: collectionsStatsQuery.data,
      });
    }
    if (collectionsStatsQuery.isError) {
      console.error(
        "[StylistDashboard] Collections stats error",
        collectionsStatsQuery.error
      );
    }
  }, [
    collectionsStatsQuery.isSuccess,
    collectionsStatsQuery.isError,
    collectionsStatsQuery.data,
    collectionsStatsQuery.error,
    filters,
  ]);

  useEffect(() => {
    if (postsStatsQuery.isSuccess) {
      console.log("[StylistDashboard] Posts stats", {
        filters,
        data: postsStatsQuery.data,
      });
    }
    if (postsStatsQuery.isError) {
      console.error(
        "[StylistDashboard] Posts stats error",
        postsStatsQuery.error
      );
    }
  }, [
    postsStatsQuery.isSuccess,
    postsStatsQuery.isError,
    postsStatsQuery.data,
    postsStatsQuery.error,
    filters,
  ]);

  const collectionCards = useMemo<StatCardConfig[]>(() => {
    return [
      {
        label: "Total Collections",
        value: collectionsStats?.totalCollections ?? 0,
        subLabel: `Published ${formatNumber(
          collectionsStats?.publishedCollections
        )}`,
        icon: <Layers className="h-5 w-5 text-cyan-400" />,
      },
      {
        label: "Draft Collections",
        value: collectionsStats?.unpublishedCollections ?? 0,
        subLabel: "Awaiting publication",
        icon: <FileText className="h-5 w-5 text-amber-400" />,
      },
      {
        label: "Collections Engagement",
        value:
          (collectionsStats?.totalLikes ?? 0) +
          (collectionsStats?.totalComments ?? 0) +
          (collectionsStats?.totalSaves ?? 0),
        subLabel: `${formatNumber(
          collectionsStats?.totalLikes
        )} likes · ${formatNumber(collectionsStats?.totalComments)} comments`,
        icon: <BarChart3 className="h-5 w-5 text-fuchsia-400" />,
      },
      {
        label: "Followers",
        value: collectionsStats?.totalFollowers ?? 0,
        subLabel: `${formatNumber(
          collectionsStats?.followersThisMonth
        )} new this month`,
        icon: <Users className="h-5 w-5 text-emerald-400" />,
      },
    ];
  }, [
    collectionsStats?.followersThisMonth,
    collectionsStats?.publishedCollections,
    collectionsStats?.totalCollections,
    collectionsStats?.totalComments,
    collectionsStats?.totalFollowers,
    collectionsStats?.totalLikes,
    collectionsStats?.totalSaves,
    collectionsStats?.unpublishedCollections,
  ]);

  const postsCards = useMemo<StatCardConfig[]>(() => {
    return [
      {
        label: "Total Posts",
        value: postsStats?.totalPosts ?? 0,
        subLabel: "Content shared",
        icon: <FileText className="h-5 w-5 text-sky-400" />,
      },
      {
        label: "Posts Engagement",
        value:
          (postsStats?.totalLikes ?? 0) + (postsStats?.totalComments ?? 0),
        subLabel: `${formatNumber(
          postsStats?.totalLikes
        )} likes · ${formatNumber(postsStats?.totalComments)} comments`,
        icon: <TrendingUp className="h-5 w-5 text-pink-400" />,
      },
      {
        label: "Followers",
        value: postsStats?.totalFollowers ?? 0,
        subLabel: `${formatNumber(
          postsStats?.followersThisMonth
        )} new this month`,
        icon: <Users className="h-5 w-5 text-indigo-400" />,
      },
    ];
  }, [
    postsStats?.followersThisMonth,
    postsStats?.totalComments,
    postsStats?.totalFollowers,
    postsStats?.totalLikes,
    postsStats?.totalPosts,
  ]);

  const handleMonthChange = (value: string) => {
    const monthValue = value === "all" ? undefined : Number(value);
    console.log("[StylistDashboard] Month changed", {
      previous: filters.month,
      next: monthValue,
    });
    setFilters((prev) => ({
      ...prev,
      month: monthValue,
    }));
  };

  const handleYearChange = (value: string) => {
    const yearValue = Number(value);
    console.log("[StylistDashboard] Year changed", {
      previous: filters.year,
      next: yearValue,
    });
    setFilters((prev) => ({
      ...prev,
      year: yearValue,
    }));
  };

  if (!user) {
    return (
      <div className="relative mx-auto w-full max-w-5xl px-6 pb-24  ">
        <GlassCard
          className="bg-white/5 text-center text-white"
          padding="3rem"
          blur="16px"
          glowColor="rgba(14, 165, 233, 0.35)"
        >
          <h2 className="text-2xl font-semibold">Sign in required</h2>
          <p className="mt-2 text-white/80">
            Please log in with your stylist account to access the studio
            dashboard.
          </p>
          <Button
            className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            asChild
          >
            <Link href="/login">Go to login</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (!isStylist) {
    return (
      <div className="relative mx-auto w-full max-w-5xl px-6 pb-24 pt-16">
        <GlassCard
          className="bg-white/5 text-center text-white"
          padding="3rem"
          blur="16px"
          glowColor="rgba(251, 191, 36, 0.3)"
        >
          <h2 className="text-2xl font-semibold">Stylist access only</h2>
          <p className="mt-2 text-white/80">
            This area is reserved for verified stylists. Contact the SOP team if
            you believe this is an error.
          </p>
          <Button
            variant="outline"
            className="mt-6 border-white/30 text-white hover:border-white hover:bg-white/10"
            asChild
          >
            <Link href="/collections">Browse collections</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-35 space-y-8">
      <div className="absolute inset-0 -z-10 " />
      <GlassCard
        padding="2.5rem"
        blur="18px"
        glowColor="rgba(59, 130, 246, 0.35)"
        className="border border-white/10 bg-slate-950/60 text-white"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.4em] text-white/80">
              Stylist Studio
            </p>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">
              Performance Dashboard
            </h1>
            <p className="max-w-2xl text-white/80">
              Monitor how your collections and community posts resonate over
              time. Adjust your creative cadence with live engagement signals.
            </p>
          </div>
          {isStylist && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.1]"
            >
              <Sparkles className="h-5 w-5" />
              Create collection
            </Button>
          )}
        </div>
      </GlassCard>

      <GlassCard
        padding="1.5rem"
        blur="16px"
        className="border border-white/5 bg-white/5 text-white"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-white/60">Year</p>
              <Select
                value={String(filters.year)}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="bg-white/10 text-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((option) => (
                    <SelectItem value={String(option.value)} key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/60">Month</p>
              <Select
                value={filters.month?.toString() ?? "all"}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="bg-white/10 text-white">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem value={option.value} key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:w-48">
            <p className="text-sm text-white/60">Quick actions</p>
            <Button
              variant="outline"
              className="bg-transparent text-white-400 hover:bg-slate-500/10"
              onClick={() => {
                collectionsStatsQuery.refetch();
                postsStatsQuery.refetch();
              }}
            >
              Refresh data
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard
        padding="1.75rem"
        blur="18px"
        glowColor="rgba(59, 130, 246, 0.25)"
        className="border border-white/10 bg-slate-950/70 text-white"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Insights snapshot
            </p>
            <h2 className="text-3xl font-semibold">
              {filters.month
                ? `Focus on ${
                    monthOptions[Number(filters.month)]?.label ??
                    `Month ${filters.month}`
                  }`
                : "Rolling performance"}
            </h2>
            <p className="text-sm text-white/70">
              Collections drive {collectionEngagementPercent}% of total
              engagement this period, while community posts contribute{" "}
              {postEngagementPercent}%.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:min-w-[320px]">
            <div className="space-y-2 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-slate-900/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white">Collections</span>
                <span className="text-white/70">
                  +{collectionsStats?.followersThisMonth ?? 0} followers
                </span>
              </div>
              <p className="text-2xl font-semibold">
                {formatNumber(totalCollectionEngagement)} interactions
              </p>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${collectionEngagementPercent}%` }}
                />
              </div>
              <p className="text-xs text-white/70">
                {collectionsActivityLabel}
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/20 to-slate-900/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white">Posts</span>
                <span className="text-white/70">
                  +{postsStats?.followersThisMonth ?? 0} followers
                </span>
              </div>
              <p className="text-2xl font-semibold">
                {formatNumber(totalPostEngagement)} interactions
              </p>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500"
                  style={{ width: `${postEngagementPercent}%` }}
                />
              </div>
              <p className="text-xs text-white/70">{postsActivityLabel}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {hasError && (
        <GlassCard
          padding="1.5rem"
          blur="16px"
          className="border border-red-500/20 bg-red-500/10 text-white"
        >
          <p className="font-semibold">Unable to load studio insights.</p>
          <p className="text-sm text-white/80">
            Please try refreshing the dashboard. If the problem persists, reach
            out to support.
          </p>
          <Button
            size="sm"
            className="mt-4 bg-white/20 text-white hover:bg-white/30"
            onClick={() => {
              collectionsStatsQuery.refetch();
              postsStatsQuery.refetch();
            }}
          >
            Retry now
          </Button>
        </GlassCard>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "overview" | "collections" | "community")
        }
        className="space-y-6"
      >
        <TabsList className="flex w-full flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 text-white/70">
          <TabsTrigger
            value="overview"
            className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white/90 data-[state=active]:text-slate-900"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white/90 data-[state=active]:text-slate-900"
          >
            Collections
          </TabsTrigger>
          <TabsTrigger
            value="community"
            className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white/90 data-[state=active]:text-slate-900"
          >
            Community posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab
            isLoading={isLoading}
            collectionCards={collectionCards}
            postsCards={postsCards}
            collectionsStats={collectionsStats}
            postsStats={postsStats}
          />
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <CollectionsTab
            isLoading={isLoading}
            collectionsStats={collectionsStats}
            collectionsActivityLabel={collectionsActivityLabel}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <CommunityTab
            isLoading={isLoading}
            postsStats={postsStats}
            postsActivityLabel={postsActivityLabel}
          />
        </TabsContent>
      </Tabs>

      {isStylist && (
        <CreateCollectionDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
