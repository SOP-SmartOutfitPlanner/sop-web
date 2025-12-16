"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Loader2,
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRevenue } from "@/hooks/admin/useRevenue";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import type { RecentTransaction, TransactionStatus, GetRevenueParams } from "@/types/revenue";

const PLAN_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getStatusBadge = (status: TransactionStatus) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="bg-green-500/20 text-green-300 border border-green-400/30 shadow-lg shadow-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 shadow-lg shadow-yellow-500/20">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "FAILED":
      return (
        <Badge className="bg-red-500/20 text-red-300 border border-red-400/30 shadow-lg shadow-red-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-gray-500/20 text-gray-300 border border-gray-400/30 shadow-lg shadow-gray-500/20">
          <Ban className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge className="bg-white/10 text-white/80">{status}</Badge>;
  }
};

export default function AdminRevenuePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  
  const pageSize = 10;

  // Build query params for main data
  const queryParams: GetRevenueParams = useMemo(() => {
    const params: GetRevenueParams = {
      recentTransactionLimit: 50,
    };
    if (selectedYear) params.year = parseInt(selectedYear);
    if (selectedMonth) params.month = parseInt(selectedMonth);
    return params;
  }, [selectedYear, selectedMonth]);

  // Fetch revenue data
  const { data, isLoading, error, isFetching } = useRevenue(queryParams);

  // Filter transactions by search query
  const filteredTransactions = useMemo(() => {
    if (!data?.recentTransactions) return [];
    if (!searchQuery.trim()) return data.recentTransactions;
    
    const query = searchQuery.toLowerCase();
    return data.recentTransactions.filter(
      (t) =>
        t.userEmail.toLowerCase().includes(query) ||
        t.userDisplayName.toLowerCase().includes(query) ||
        t.subscriptionPlanName.toLowerCase().includes(query) ||
        t.transactionCode.toString().includes(query)
    );
  }, [data?.recentTransactions, searchQuery]);

  // Table columns
  const columns = useMemo<ColumnDef<RecentTransaction>[]>(
    () => [
      {
        accessorKey: "transactionCode",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-white/10 p-0 text-white/90 hover:text-white"
          >
            Transaction Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-cyan-300">#{getValue() as number}</span>
        ),
      },
      {
        accessorKey: "userDisplayName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-white/10 p-0 text-white/90 hover:text-white"
          >
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const transaction = row.original;
          return (
            <div>
              <p className="font-medium text-white">{transaction.userDisplayName}</p>
              <p className="text-xs text-white/50">{transaction.userEmail}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "subscriptionPlanName",
        header: "Plan",
        cell: ({ getValue }) => (
          <Badge className="bg-purple-500/20 text-purple-300 border border-purple-400/30">
            {getValue() as string}
          </Badge>
        ),
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-white/10 p-0 text-white/90 hover:text-white"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="font-semibold text-green-400">
            {formatCurrency(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => getStatusBadge(getValue() as TransactionStatus),
      },
      {
        accessorKey: "createdDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-white/10 p-0 text-white/90 hover:text-white"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return (
            <div className="text-white/70">
              <span>{format(date, "dd/MM/yyyy")}</span>
              <span className="text-white/50 ml-2">{format(date, "HH:mm")}</span>
            </div>
          );
        },
      },
    ],
    []
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Chart data for monthly revenue - display all 12 months
  const monthlyChartData = useMemo(() => {
    const allMonths = [
      { month: 1, name: "Jan" },
      { month: 2, name: "Feb" },
      { month: 3, name: "Mar" },
      { month: 4, name: "Apr" },
      { month: 5, name: "May" },
      { month: 6, name: "Jun" },
      { month: 7, name: "Jul" },
      { month: 8, name: "Aug" },
      { month: 9, name: "Sep" },
      { month: 10, name: "Oct" },
      { month: 11, name: "Nov" },
      { month: 12, name: "Dec" },
    ];

    return allMonths.map((m) => {
      const monthData = data?.monthlyRevenue?.find((item) => item.month === m.month);
      return {
        name: m.name,
        revenue: monthData?.revenue || 0,
        transactions: monthData?.transactionCount || 0,
      };
    });
  }, [data?.monthlyRevenue]);

  // Chart data for revenue by plan
  const planChartData = useMemo(() => {
    if (!data?.revenueByPlan) return [];
    return data.revenueByPlan.map((item) => ({
      name: item.planName,
      value: item.totalRevenue,
      subscriptions: item.totalSubscriptions,
      active: item.activeSubscriptions,
    }));
  }, [data?.revenueByPlan]);

  // Chart data for transaction status distribution
  const statusChartData = useMemo(() => {
    return [
      {
        name: "Completed",
        value: data?.totalCompletedTransactions || 0,
        color: "#10B981",
      },
      {
        name: "Failed",
        value: data?.totalFailedTransactions || 0,
        color: "#EF4444",
      },
      {
        name: "Cancelled",
        value: data?.totalCancelledTransactions || 0,
        color: "#6B7280",
      },
      {
        name: "Pending",
        value: data?.totalPendingTransactions || 0,
        color: "#F59E0B",
      },
    ].filter((item) => item.value > 0);
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white/70">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-4">An error occurred while loading revenue data</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(data?.totalRevenue || 0),
      icon: DollarSign,
      color: "bg-green-500",
      subtext: "From completed transactions",
    },
    {
      title: "Total Transactions",
      value: data?.totalTransactions || 0,
      icon: CreditCard,
      color: "bg-blue-500",
      subtext: `${data?.totalCompletedTransactions || 0} completed`,
    },
    {
      title: "Active Subscriptions",
      value: data?.totalActiveSubscriptions || 0,
      icon: Users,
      color: "bg-purple-500",
      subtext: "Current premium users",
    },
    {
      title: "Success Rate",
      value:
        data?.totalTransactions && data?.totalTransactions > 0
          ? `${Math.round(((data?.totalCompletedTransactions || 0) / data.totalTransactions) * 100)}%`
          : "0%",
      icon: TrendingUp,
      color: "bg-orange-500",
      subtext: `${data?.totalFailedTransactions || 0} failed, ${data?.totalCancelledTransactions || 0} cancelled`,
    },
  ];

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Month options
  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
            Revenue Analytics
          </h1>
          <p className="text-white/70 mt-2">
            Monitor subscription revenue and transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white">
              <Calendar className="w-4 h-4 mr-2 text-white/60" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/10 max-h-[300px] overflow-y-auto">
              <SelectItem value="all" className="text-white/90 hover:bg-white/10 focus:bg-white/10">
                All Years
              </SelectItem>
              {yearOptions.map((year) => (
                <SelectItem
                  key={year}
                  value={year.toString()}
                  className="text-white/90 hover:bg-white/10 focus:bg-white/10"
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2 text-white/60" />
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-xl border border-white/10 max-h-[700px] overflow-y-auto">
              <SelectItem value="all" className="text-white/90 hover:bg-white/10 focus:bg-white/10">
                All Months
              </SelectItem>
              {monthOptions.map((month) => (
                <SelectItem
                  key={month.value}
                  value={month.value}
                  className="text-white/90 hover:bg-white/10 focus:bg-white/10"
                >
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
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
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-cyan-400 mt-1 font-medium">{stat.subtext}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Monthly Revenue</CardTitle>
            <p className="text-sm text-white/60">Revenue breakdown by month</p>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("vi-VN", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(value)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "white",
                    }}
                    labelStyle={{ color: "white" }}
                    itemStyle={{ color: "white" }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-white/50">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Plan Pie Chart */}
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Revenue by Plan</CardTitle>
            <p className="text-sm text-white/60">Distribution across subscription plans</p>
          </CardHeader>
          <CardContent>
            {planChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent as number) * 100).toFixed(0)}%)`
                    }
                  >
                    {planChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PLAN_COLORS[index % PLAN_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "white",
                    }}
                    labelStyle={{ color: "white" }}
                    itemStyle={{ color: "white" }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-white/80">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-white/50">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Status Pie Chart */}
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Transaction Status</CardTitle>
            <p className="text-sm text-white/60">Distribution by transaction status</p>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={(props: any) => `${props.name}: ${props.value}`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "white",
                    }}
                    labelStyle={{ color: "white" }}
                    itemStyle={{ color: "white" }}
                    formatter={(value: number) => [value, "Transactions"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-white/80">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-white/50">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Details Cards */}
      {data?.revenueByPlan && data.revenueByPlan.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.revenueByPlan.map((plan, index) => (
            <Card
              key={plan.subscriptionPlanId}
              className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-white">
                    {plan.planName}
                  </CardTitle>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: PLAN_COLORS[index % PLAN_COLORS.length] }}
                  />
                </div>
                <p className="text-sm text-white/60">
                  {formatCurrency(plan.planPrice)} / subscription
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Revenue</span>
                    <span className="font-semibold text-green-400">
                      {formatCurrency(plan.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Subscriptions</span>
                    <span className="font-semibold text-white">{plan.totalSubscriptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Active Subscriptions</span>
                    <span className="font-semibold text-cyan-400">{plan.activeSubscriptions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Transactions Table */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <p className="text-sm text-white/60 mt-1">
                {isFetching ? "Updating..." : `${filteredTransactions.length} transactions`}
              </p>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-cyan-400/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/10 overflow-hidden bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b [&_tr]:border-white/10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="bg-white/5 transition-colors hover:bg-white/10"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="h-12 px-4 text-left align-middle font-semibold text-white/90 text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/10 transition-colors hover:bg-white/5 data-[state=selected]:bg-white/10"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="h-24 text-center text-white/60">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 0 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="text-sm text-white/70 font-medium">
                {filteredTransactions.length > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-cyan-300">
                      {table.getState().pagination.pageIndex * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-cyan-300">
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) * pageSize,
                        filteredTransactions.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-cyan-300">
                      {filteredTransactions.length}
                    </span>{" "}
                    transactions
                  </>
                ) : (
                  <span>No transactions found</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  className="border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                  const page = i + 1;
                  const currentPage = table.getState().pagination.pageIndex + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => table.setPageIndex(page - 1)}
                      className={
                        page === currentPage
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border-0 hover:from-cyan-600 hover:to-blue-700 min-w-[2.5rem] transition-all duration-300"
                          : "border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 min-w-[2.5rem] transition-all duration-300"
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  className="border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
