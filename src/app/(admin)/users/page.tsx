"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, UserPlus, Mail, Shield, Ban } from "lucide-react";

// Mock data
const mockUsers = [
  {
    id: "1",
    displayName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "User",
    status: "Active",
    itemCount: 45,
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    displayName: "Trần Thị B",
    email: "tranthib@example.com",
    role: "User",
    status: "Active",
    itemCount: 32,
    joinedDate: "2024-02-20",
  },
  {
    id: "3",
    displayName: "Admin User",
    email: "admin@sop.com",
    role: "Admin",
    status: "Active",
    itemCount: 0,
    joinedDate: "2023-12-01",
  },
  {
    id: "4",
    displayName: "Lê Văn C",
    email: "levanc@example.com",
    role: "User",
    status: "Inactive",
    itemCount: 12,
    joinedDate: "2024-03-10",
  },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    if (role === "Admin" || role === "SuperAdmin") {
      return <Badge className="bg-blue-600">{role}</Badge>;
    }
    return <Badge variant="secondary">{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "Active") {
      return <Badge className="bg-green-600">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Users</h1>
          <p className="text-gray-600 mt-2">
            Quản lý người dùng và phân quyền
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">2,543</div>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">2,401</div>
            <p className="text-sm text-gray-600 mt-1">Active Users</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">142</div>
            <p className="text-sm text-gray-600 mt-1">Inactive Users</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">5</div>
            <p className="text-sm text-gray-600 mt-1">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                        {user.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <span className="font-medium">{user.itemCount}</span> items
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(user.joinedDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Gửi email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="w-4 h-4 mr-2" />
                          Đổi quyền
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Ban className="w-4 h-4 mr-2" />
                          Khóa tài khoản
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

