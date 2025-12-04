"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shirt, TrendingUp, Activity } from "lucide-react";
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

// Mock data - replace with real API
const userGrowthData = [
  { month: "Jan", users: 400, active: 240 },
  { month: "Feb", users: 300, active: 139 },
  { month: "Mar", users: 200, active: 200 },
  { month: "Apr", users: 278, active: 190 },
  { month: "May", users: 189, active: 180 },
  { month: "Jun", users: 239, active: 200 },
  { month: "Jul", users: 349, active: 280 },
  { month: "Aug", users: 400, active: 320 },
  { month: "Sep", users: 450, active: 350 },
  { month: "Oct", users: 500, active: 400 },
];

const itemsData = [
  { category: "Tops", count: 3245 },
  { category: "Bottoms", count: 2876 },
  { category: "Footwear", count: 1543 },
  { category: "Accessories", count: 1257 },
];

const activityData = [
  { day: "Mon", logins: 120, uploads: 45 },
  { day: "Tue", logins: 150, uploads: 60 },
  { day: "Wed", logins: 180, uploads: 75 },
  { day: "Thu", logins: 160, uploads: 55 },
  { day: "Fri", logins: 200, uploads: 90 },
  { day: "Sat", logins: 90, uploads: 30 },
  { day: "Sun", logins: 70, uploads: 20 },
];

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"];

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Items",
      value: "8,921",
      change: "+8.2%",
      icon: Shirt,
      color: "bg-green-500",
    },
    {
      title: "Active Today",
      value: "1,234",
      change: "+5.1%",
      icon: Activity,
      color: "bg-purple-500",
    },
    {
      title: "Growth",
      value: "24.3%",
      change: "+2.4%",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

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
                <div className="text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <p className="text-sm text-cyan-400 mt-1 font-medium">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="border border-white/10 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">User Growth</CardTitle>
            <p className="text-sm text-white/60">Monthly user registration trends</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="New Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Items by Category */}
        <Card className="border border-white/10 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Items by Category</CardTitle>
            <p className="text-sm text-white/60">Distribution of wardrobe items</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={itemsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const name = (props as unknown as { name: string }).name;
                    const percent = (props as unknown as { percent: number }).percent;
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {itemsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Activity */}
        <Card className="border border-white/10 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Weekly Activity</CardTitle>
            <p className="text-sm text-white/60">User logins and item uploads</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="logins" fill="#3B82F6" name="Logins" />
                <Bar dataKey="uploads" fill="#8B5CF6" name="Uploads" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">System Information</CardTitle>
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

    </div>
  );
}
