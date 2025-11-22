"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Users, Shirt, TrendingUp, Activity, Bell } from "lucide-react";
import { usePushNotification } from "@/hooks/admin/usePushNotification";
import { Loader2 } from "lucide-react";
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
  { month: "T1", users: 400, active: 240 },
  { month: "T2", users: 300, active: 139 },
  { month: "T3", users: 200, active: 200 },
  { month: "T4", users: 278, active: 190 },
  { month: "T5", users: 189, active: 180 },
  { month: "T6", users: 239, active: 200 },
  { month: "T7", users: 349, active: 280 },
  { month: "T8", users: 400, active: 320 },
  { month: "T9", users: 450, active: 350 },
  { month: "T10", users: 500, active: 400 },
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
  const [isPushDialogOpen, setIsPushDialogOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<"all" | "user">("all");
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formHref, setFormHref] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formUserId, setFormUserId] = useState("");

  const pushNotificationMutation = usePushNotification();

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Tổng quan hệ thống và thống kê 
          </p>
        </div>
        <Button
          onClick={() => setIsPushDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Bell className="w-4 h-4 mr-2" />
          Push Notification
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-sm text-green-600 mt-1">
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
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <p className="text-sm text-gray-500">Monthly user registration trends</p>
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
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Items by Category</CardTitle>
            <p className="text-sm text-gray-500">Distribution of wardrobe items</p>
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
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <p className="text-sm text-gray-500">User logins and item uploads</p>
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
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Version</p>
              <p className="text-lg font-semibold text-gray-900">v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900">2024-10-18</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-green-600">Healthy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Dialog */}
      <Dialog open={isPushDialogOpen} onOpenChange={setIsPushDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Push Notification</DialogTitle>
            <DialogDescription>
              Send a push notification to users. Use actorUserId = 1 to send to all users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notification-type">Recipient</Label>
              <RadioGroup
                value={notificationType}
                onValueChange={(value) => setNotificationType(value as "all" | "user")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Users (Broadcast)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="font-normal cursor-pointer">
                    Specific User
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {notificationType === "user" && (
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  type="number"
                  placeholder="Enter user ID..."
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter notification title..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter notification message..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="href">Link (Optional)</Label>
              <Input
                id="href"
                placeholder="e.g., /wardrobe, /profile/123"
                value={formHref}
                onChange={(e) => setFormHref(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL (Optional)</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPushDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePushNotification}
              disabled={pushNotificationMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {pushNotificationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
