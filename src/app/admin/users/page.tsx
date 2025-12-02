"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  UserPlus,
  Mail,
  Shield,
  Ban,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import type { AdminUser } from "@/lib/api/admin-api";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const pageSize = 10;

  // Fetch users from API
  const { data, isLoading, error, isFetching } = useAdminUsers({
    page: currentPage,
    pageSize,
    search: searchQuery || undefined,
  });

  const getRoleBadge = (role: number) => {
    if (role === 1) {
      return <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-lg shadow-cyan-500/20">Admin</Badge>;
    }
    return <Badge className="bg-white/10 text-white/80 border border-white/20">User</Badge>;
  };

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return <Badge className="bg-green-500/20 text-green-300 border border-green-400/30 shadow-lg shadow-green-500/20">Verified</Badge>;
    }
    return <Badge className="bg-white/10 text-white/60 border border-white/20">Unverified</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-white/10 p-0 text-white/90 hover:text-white"
            >
              User
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                {user.avtUrl ? (
                  <AvatarImage src={user.avtUrl} alt={user.displayName} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{user.displayName}</p>
                <p className="text-xs text-white/50">ID: {user.id}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-white/10 p-0 text-white/90 hover:text-white"
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ getValue }) => (
          <span className="text-white/80">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => getRoleBadge(getValue() as number),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "isVerifiedEmail",
        header: "Status",
        cell: ({ getValue }) => getStatusBadge(getValue() as boolean),
      },
      {
        accessorKey: "isPremium",
        header: "Premium",
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-lg shadow-purple-500/20">Premium</Badge>
          ) : (
            <Badge className="bg-white/10 text-white/60 border border-white/20">Free</Badge>
          ),
      },
      {
        accessorKey: "isLoginWithGoogle",
        header: "Login Type",
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge className="bg-white/10 text-white/80 border border-white/20 gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Badge>
          ) : (
            <Badge className="bg-white/10 text-white/80 border border-white/20">Email</Badge>
          ),
      },
      {
        accessorKey: "createdDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-white/10 p-0 text-white/90 hover:text-white"
            >
              Joined Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return (
            <div className="flex flex-col gap-1 text-white/70">
              <span>{format(date, "dd/MM/yyyy")}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: () => {
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white/70 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900/95 backdrop-blur-xl border border-white/10">
                  <DropdownMenuItem className="text-white/90 hover:bg-white/10 focus:bg-white/10">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white/90 hover:bg-white/10 focus:bg-white/10">
                    <Shield className="w-4 h-4 mr-2" />
                    Change Role
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
                    <Ban className="w-4 h-4 mr-2" />
                    Lock Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  const users = data?.data || [];
  const metaData = data?.metaData;

  // Auto-reset to last valid page if current page exceeds totalPages
  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      metaData &&
      currentPage > metaData.totalPages
    ) {
      const timer = setTimeout(() => {
        setCurrentPage(metaData.totalPages);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isFetching, metaData, currentPage]);

  // Initialize TanStack Table
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    pageCount: metaData?.totalPages || 1,
    manualPagination: true,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white/70">Loading data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            An error occurred while loading data
          </p>
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-white/70 mt-2">Manage users and assign roles</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/40">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-white">
              {metaData?.totalCount || 0}
            </div>
            <p className="text-sm text-white/60 mt-1">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-cyan-400">
              {users.filter((u: (typeof users)[0]) => u.isVerifiedEmail).length}
            </div>
            <p className="text-sm text-white/60 mt-1">Verified Users</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-400">
              {
                users.filter((u: (typeof users)[0]) => !u.isVerifiedEmail)
                  .length
              }
            </div>
            <p className="text-sm text-white/60 mt-1">Unverified Users</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-400">
              {users.filter((u: (typeof users)[0]) => u.role === 1).length}
            </div>
            <p className="text-sm text-white/60 mt-1">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Users List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
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
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="h-24 text-center text-white/60">
                        No results.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {metaData && metaData.totalPages > 0 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="text-sm text-white/70 font-medium">
                {users.length > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-cyan-300">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-cyan-300">
                      {Math.min(currentPage * pageSize, metaData.totalCount)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-cyan-300">{metaData.totalCount}</span>{" "}
                    users
                  </>
                ) : (
                  <span>No users found</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    !metaData.hasPrevious || isFetching || currentPage === 1
                  }
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                {Array.from(
                  { length: Math.min(5, metaData.totalPages) },
                  (_: unknown, i: number): React.ReactElement | null => {
                    const page = i + 1;
                    if (page > metaData.totalPages) {
                      return null;
                    }
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        disabled={isFetching || page > metaData.totalPages}
                        onClick={() => setCurrentPage(page)}
                        className={
                          page === currentPage 
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border-0 hover:from-cyan-600 hover:to-blue-700 min-w-[2.5rem] transition-all duration-300" 
                            : "border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 min-w-[2.5rem] transition-all duration-300"
                        }
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    !metaData.hasNext ||
                    isFetching ||
                    currentPage >= metaData.totalPages
                  }
                  onClick={() => setCurrentPage((p) => p + 1)}
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
