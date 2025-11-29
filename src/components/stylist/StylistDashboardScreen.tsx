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
  Calendar,
  Activity,
  Eye,
  Heart,
  MessageSquare,
  BookmarkCheck,
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
const YEAR_RANGE = 4;

const yearOptions = Array.from({ length: YEAR_RANGE }, (_, index) => ({
  label: `${CURRENT_YEAR - index}`,
  value: CURRENT_YEAR - index,
}));

interface DashboardFilters {
  year: number;
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
    topCollectionsCount: 6,
    topPostsCount: 6,
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
      filters.topCollectionsCount,
    ],
    queryFn: () =>
      stylistAPI.getCollectionsStats({
        year: filters.year,
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
      filters.topPostsCount,
    ],
    queryFn: () =>
      stylistAPI.getPostsStats({
        year: filters.year,
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
    return collectionsStats.monthlyStats.at(-1) ?? null;
  }, [collectionsStats?.monthlyStats]);

  const latestPostsPulse = useMemo(() => {
    if (!postsStats?.monthlyStats?.length) return null;
    return postsStats.monthlyStats.at(-1) ?? null;
  }, [postsStats?.monthlyStats]);

  const totalCollectionEngagement =
    (collectionsStats?.totalLikes ?? 0) +
    (collectionsStats?.totalComments ?? 0) +
    (collectionsStats?.totalSaves ?? 0) +
    (postsStats?.totalLikes ?? 0) +
    (postsStats?.totalComments ?? 0);
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
      return "No collection activity logged for this year.";
    }
    return `Most recent activity (${latestCollectionsPulse.monthName}): ${latestCollectionsPulse.collectionsCreated} collections published`;
  }, [latestCollectionsPulse]);

  const postsActivityLabel = useMemo(() => {
    if (!latestPostsPulse) {
      return "No post activity logged for this year.";
    }
    return `Most recent activity (${latestPostsPulse.monthName}): ${latestPostsPulse.postsCreated} posts shared`;
  }, [latestPostsPulse]);

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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      {/* Animated background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-40 top-60 h-96 w-96 animate-pulse rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-40 left-1/2 h-80 w-80 animate-pulse rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>
      
      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl space-y-8 mt-10">
        {/* Header Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-cyan-500/25">
                <div className="absolute inset-[2px] flex items-center justify-center rounded-[14px] bg-slate-900">
                  <Activity className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  Stylist Studio
                </p>
                <h1 className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-3xl font-black text-transparent md:text-4xl">
                  Dashboard
                </h1>
              </div>
            </div>
            <p className="max-w-xl text-base text-white/60">
              Track your yearly performance and audience growth
            </p>
          </div>
          {/* <div className="flex flex-wrap items-center gap-3">
            {isStylist && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-cyan-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                New Collection
              </Button>
            )}
          </div> */}
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Collections Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900/80 to-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-10 -translate-y-10 rounded-full bg-cyan-500/20 blur-3xl transition-all group-hover:scale-150" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div className="rounded-lg bg-cyan-500/10 px-2.5 py-1">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/80">Total Collections</p>
                <p className="mt-2 text-4xl font-black text-white">
                  {formatNumber(collectionsStats?.totalCollections ?? 0)}
                </p>
              </div>
              <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10">
                  <Eye className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <p className="text-xs font-medium text-white/60">
                  {formatNumber(collectionsStats?.publishedCollections ?? 0)} published
                </p>
              </div>
            </div>
          </div>

          {/* Collections Engagement Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-slate-900/80 to-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-fuchsia-500/40 hover:shadow-2xl hover:shadow-fuchsia-500/20 hover:-translate-y-1">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-10 -translate-y-10 rounded-full bg-fuchsia-500/20 blur-3xl transition-all group-hover:scale-150" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/30">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="rounded-lg bg-fuchsia-500/10 px-2.5 py-1">
                  <span className="text-xs font-bold text-fuchsia-400">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-400/80">Engagement</p>
                <p className="mt-2 text-4xl font-black text-white">
                  {formatNumber(totalCollectionEngagement)}
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-fuchsia-400" />
                  <span className="text-xs font-medium text-white/60">
                    {formatNumber((collectionsStats?.totalLikes ?? 0) + (postsStats?.totalLikes ?? 0))}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-fuchsia-400" />
                  <span className="text-xs font-medium text-white/60">
                    {formatNumber((collectionsStats?.totalComments ?? 0) + (postsStats?.totalComments ?? 0))}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookmarkCheck className="h-3.5 w-3.5 text-fuchsia-400" />
                  <span className="text-xs font-medium text-white/60">
                    {formatNumber(collectionsStats?.totalSaves ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Posts Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-slate-900/80 to-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-10 -translate-y-10 rounded-full bg-indigo-500/20 blur-3xl transition-all group-hover:scale-150" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="rounded-lg bg-indigo-500/10 px-2.5 py-1">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400/80">Community Posts</p>
                <p className="mt-2 text-4xl font-black text-white">
                  {formatNumber(postsStats?.totalPosts ?? 0)}
                </p>
              </div>
              <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10">
                  <Heart className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <p className="text-xs font-medium text-white/60">
                  {formatNumber(postsStats?.totalLikes ?? 0)} total likes
                </p>
              </div>
            </div>
          </div>

          {/* Total Followers Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-10 -translate-y-10 rounded-full bg-emerald-500/20 blur-3xl transition-all group-hover:scale-150" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="rounded-lg bg-emerald-500/10 px-2.5 py-1">
                  <span className="text-xs font-bold text-emerald-400">
                    +{formatNumber((collectionsStats?.followersThisMonth ?? 0))}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80">Total Followers</p>
                <p className="mt-2 text-4xl font-black text-white">
                  {formatNumber(Math.max(collectionsStats?.totalFollowers ?? 0, postsStats?.totalFollowers ?? 0))}
                </p>
              </div>
              <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="text-xs font-medium text-white/60">
                  New this month
                </p>
              </div>
            </div>
          </div>
        </div>

        {hasError && (
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-slate-900/50 p-6 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/20">
                <Activity className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-lg font-bold text-white">Unable to load studio insights</p>
                  <p className="mt-1 text-sm text-white/60">
                    Please try refreshing the dashboard. If the problem persists, reach out to support.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-lg bg-white/10 text-sm font-medium text-white transition-colors hover:bg-white/20"
                  onClick={() => {
                    collectionsStatsQuery.refetch();
                    postsStatsQuery.refetch();
                  }}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Retry now
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 transition-colors hover:border-cyan-500/30 hover:bg-white/10">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <Select
                  value={String(filters.year)}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="h-auto border-0 bg-transparent p-0 text-sm font-medium text-white focus:ring-0">
                    <SelectValue placeholder="Year" />
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
              <span className="text-sm text-white/50">Full year analytics</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white/80 transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:text-white"
              onClick={() => {
                collectionsStatsQuery.refetch();
                postsStatsQuery.refetch();
              }}
            >
              <Activity className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>
        {/* Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "overview" | "collections" | "community")
          }
          className="space-y-8"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-1.5 backdrop-blur-xl shadow-xl">
            <TabsList className="flex w-full gap-2 bg-transparent">
              <TabsTrigger
                value="overview"
                className="group flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white/60 transition-all hover:text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:via-indigo-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-cyan-500/30"
              >
                <BarChart3 className="mr-2 h-4 w-4 transition-transform group-data-[state=active]:scale-110" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="collections"
                className="group flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white/60 transition-all hover:text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:via-indigo-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-indigo-500/30"
              >
                <Layers className="mr-2 h-4 w-4 transition-transform group-data-[state=active]:scale-110" />
                Collections
              </TabsTrigger>
              <TabsTrigger
                value="community"
                className="group flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white/60 transition-all hover:text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:via-indigo-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-fuchsia-500/30"
              >
                <FileText className="mr-2 h-4 w-4 transition-transform group-data-[state=active]:scale-110" />
                Community
              </TabsTrigger>
            </TabsList>
          </div>

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
              onPostsChanged={() => postsStatsQuery.refetch()}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Collection Dialog */}
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
