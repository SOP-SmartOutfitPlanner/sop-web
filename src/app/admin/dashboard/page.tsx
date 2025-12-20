"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shirt, TrendingUp, Activity, Bell, Send, MessageSquare, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { usePushNotification } from "@/hooks/admin/usePushNotification";
import { useDashboard, useUserGrowth } from "@/hooks/admin/useDashboard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFormInputs";

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4"];

// Helper functions outside component to avoid re-creation
const formatChange = (percentageChange: number, changeDirection: string) => {
  const sign = changeDirection === "up" ? "+" : changeDirection === "down" ? "-" : "";
  return `${sign}${Math.abs(percentageChange).toFixed(1)}%`;
};

const formatValue = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

// Generate year options once
const YEAR_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
})();

// Loading skeleton component
const StatCardSkeleton = () => (
  <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
      <div className="h-11 w-11 bg-white/10 rounded-xl animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-24 bg-white/10 rounded animate-pulse mb-2" />
      <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <div className="h-[300px] bg-white/5 rounded-xl animate-pulse flex items-center justify-center">
    <div className="text-white/30">Loading chart...</div>
  </div>
);

export default function AdminDashboardPage() {
  const [isPushDialogOpen, setIsPushDialogOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<"all" | "user">("all");
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formHref, setFormHref] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formUserId, setFormUserId] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const pushNotificationMutation = usePushNotification();
  
  // Fetch dashboard data from API
  const { overview, itemsByCategory, weeklyActivity, isLoading } = useDashboard();
  const userGrowth = useUserGrowth(selectedYear);

  // Transform user growth data for chart
  const userGrowthData = useMemo(() => {
    if (!userGrowth.data) return [];
    return userGrowth.data.map((item) => ({
      month: item.monthName?.substring(0, 3) || item.month,
      users: item.newUsers,
      active: item.activeUsers,
    }));
  }, [userGrowth.data]);

  // Transform items by category data for pie chart
  const itemsData = useMemo(() => {
    if (!itemsByCategory.data) return [];
    return itemsByCategory.data.map((item) => ({
      category: item.categoryName,
      count: item.itemCount,
      percentage: item.percentage,
    }));
  }, [itemsByCategory.data]);

  // Transform weekly activity data for bar chart
  const activityData = useMemo(() => {
    if (!weeklyActivity.data) return [];
    return weeklyActivity.data.map((item) => ({
      day: item.dayOfWeek.substring(0, 3),
      newUsers: item.newUsers,
      newItems: item.newItems,
    }));
  }, [weeklyActivity.data]);

  // Build stats from overview data
  const stats = useMemo(() => {
    const data = overview.data;
    if (!data) return [];

    return [
      {
        title: "Total Users",
        value: formatValue(data.totalUsers.value),
        change: formatChange(data.totalUsers.percentageChange, data.totalUsers.changeDirection),
        changeDirection: data.totalUsers.changeDirection,
        icon: Users,
        color: "bg-blue-500",
      },
      {
        title: "Total Items",
        value: formatValue(data.totalItems.value),
        change: formatChange(data.totalItems.percentageChange, data.totalItems.changeDirection),
        changeDirection: data.totalItems.changeDirection,
        icon: Shirt,
        color: "bg-green-500",
      },
      {
        title: "Revenue Today",
        value: `$${formatValue(data.revenueToday.value)}`,
        change: formatChange(data.revenueToday.percentageChange, data.revenueToday.changeDirection),
        changeDirection: data.revenueToday.changeDirection,
        icon: DollarSign,
        color: "bg-purple-500",
      },
      {
        title: "Posts Today",
        value: formatValue(data.communityPostsToday.value),
        change: formatChange(data.communityPostsToday.percentageChange, data.communityPostsToday.changeDirection),
        changeDirection: data.communityPostsToday.changeDirection,
        icon: MessageSquare,
        color: "bg-orange-500",
      },
    ];
  }, [overview.data]);

  const handlePushNotification = async () => {
    if (!formTitle.trim()) {
      return;
    }
    if (!formMessage.trim()) {
      return;
    }

    const actorUserId = notificationType === "all" ? 1 : parseInt(formUserId);
    if (notificationType === "user" && (!formUserId || isNaN(actorUserId))) {
      return;
    }

    try {
      await pushNotificationMutation.mutateAsync({
        title: formTitle,
        message: formMessage,
        href: formHref.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
        actorUserId,
      });
      setIsPushDialogOpen(false);
      setFormTitle("");
      setFormMessage("");
      setFormHref("");
      setFormImageUrl("");
      setFormUserId("");
      setNotificationType("all");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-white/70 mt-2">
            System statistics and analytics at a glance
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overview.isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.changeDirection === "up";
            const isNegative = stat.changeDirection === "down";
            return (
              <Card
                key={stat.title}
                className="border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/5 backdrop-blur-xl overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/70">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <p className={`text-sm mt-1 font-medium flex items-center gap-1 ${
                    isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-white/60"
                  }`}>
                    {isPositive && <ArrowUp className="w-3 h-3" />}
                    {isNegative && <ArrowDown className="w-3 h-3" />}
                    {stat.change} from last period
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="border border-white/10 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-white">
                  User Growth
                </CardTitle>
                <p className="text-sm text-white/60">
                  Monthly user registration trends
                </p>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm"
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year} className="bg-gray-800">
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {userGrowth.isLoading ? (
              <ChartSkeleton />
            ) : userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="New Users"
                    dot={{ fill: '#3B82F6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Active Users"
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/40">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items by Category */}
        <Card className="border border-white/10 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Items by Category
            </CardTitle>
            <p className="text-sm text-white/60">
              Distribution of wardrobe items
            </p>
          </CardHeader>
          <CardContent>
            {itemsByCategory.isLoading ? (
              <ChartSkeleton />
            ) : itemsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={itemsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const { name, percent } = props as unknown as { name: string; percent: number };
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="category"
                  >
                    {itemsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Items']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/40">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Activity */}
        <Card className="border border-white/10 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Weekly Activity
            </CardTitle>
            <p className="text-sm text-white/60">
              New users and items this week
            </p>
          </CardHeader>
          <CardContent>
            {weeklyActivity.isLoading ? (
              <ChartSkeleton />
            ) : activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="newUsers" fill="#3B82F6" name="New Users" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="newItems" fill="#8B5CF6" name="New Items" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/40">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/20">
              <p className="text-sm text-white/70 font-medium">Version</p>
              <p className="text-2xl font-bold text-white mt-1">v1.0.0</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/20">
              <p className="text-sm text-white/70 font-medium">Last Updated</p>
              <p className="text-2xl font-bold text-white mt-1">2024-10-18</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/20">
              <p className="text-sm text-white/70 font-medium">Status</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></span>
                Healthy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Dialog */}
      <AdminModal
        open={isPushDialogOpen}
        onOpenChange={setIsPushDialogOpen}
        onConfirm={handlePushNotification}
        title="Push Notification"
        subtitle="Send a push notification to users"
        icon={<Bell className="w-5 h-5" />}
        iconClassName="from-cyan-500 to-blue-600"
        maxWidth="600px"
        confirmButtonText="Send Notification"
        confirmButtonIcon={<Send className="w-4 h-4" />}
        confirmButtonColor="rgba(59, 130, 246, 0.8)"
        confirmButtonBorderColor="rgba(59, 130, 246, 1)"
        isLoading={pushNotificationMutation.isPending}
        loadingText="Sending..."
      >
        <div className="space-y-5">
          {/* Recipient Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/90">
              Recipient
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="notificationType"
                  value="all"
                  checked={notificationType === "all"}
                  onChange={() => setNotificationType("all")}
                  className="w-4 h-4 text-cyan-500 bg-white/10 border-white/30 focus:ring-cyan-500/50 focus:ring-offset-0"
                />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  All Users (Broadcast)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="notificationType"
                  value="user"
                  checked={notificationType === "user"}
                  onChange={() => setNotificationType("user")}
                  className="w-4 h-4 text-cyan-500 bg-white/10 border-white/30 focus:ring-cyan-500/50 focus:ring-offset-0"
                />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  Specific User
                </span>
              </label>
            </div>
          </div>

          {/* User ID (conditional) */}
          {notificationType === "user" && (
            <AdminInput
              id="user-id"
              type="number"
              label="User ID"
              placeholder="Enter user ID..."
              value={formUserId}
              onChange={(e) => setFormUserId(e.target.value)}
              required
            />
          )}

          {/* Title */}
          <AdminInput
            id="title"
            label="Title"
            placeholder="Enter notification title..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          {/* Message */}
          <AdminTextarea
            id="message"
            label="Message"
            placeholder="Enter notification message..."
            value={formMessage}
            onChange={(e) => setFormMessage(e.target.value)}
            rows={4}
            required
          />

          {/* Link */}
          <AdminInput
            id="href"
            label="Link (Optional)"
            placeholder="e.g., /wardrobe, /profile/123"
            value={formHref}
            onChange={(e) => setFormHref(e.target.value)}
          />

          {/* Image URL */}
          <AdminInput
            id="image-url"
            type="url"
            label="Image URL (Optional)"
            placeholder="https://example.com/image.jpg"
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
          />
        </div>
      </AdminModal>
    </div>
  );
}
