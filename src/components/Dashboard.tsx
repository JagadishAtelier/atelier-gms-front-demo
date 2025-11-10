import React, { useState } from "react";
import { NavigationItem } from "../App";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  FileText,
  Clipboard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const mockData = {
  activeMembers: 245,
  upcomingRenewals: 23,
  pendingDues: 12450,
  lateFeesTotal: 2100,
  todayCheckins: { morning: 67, evening: 89 },
  monthlyRevenue: 85600,
  peakHoursData: [
    { time: "6 AM", morning: 25, evening: 5 },
    { time: "7 AM", morning: 45, evening: 8 },
    { time: "8 AM", morning: 60, evening: 12 },
    { time: "9 AM", morning: 40, evening: 15 },
    { time: "10 AM", morning: 30, evening: 20 },
    { time: "6 PM", morning: 10, evening: 55 },
    { time: "7 PM", morning: 8, evening: 70 },
    { time: "8 PM", morning: 5, evening: 85 },
    { time: "9 PM", morning: 3, evening: 60 },
    { time: "10 PM", morning: 2, evening: 35 },
  ],
  revenueData: [
    { month: "Jan", revenue: 78000, pending: 8500 },
    { month: "Feb", revenue: 82000, pending: 7200 },
    { month: "Mar", revenue: 85600, pending: 12450 },
  ],
};

interface DashboardProps {
  onNavigate?: (page: NavigationItem) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [peakHoursView, setPeakHoursView] = useState<"morning" | "evening">(
    "morning"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 font-semibold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your gym overview.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.upcomingRenewals}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{mockData.pendingDues.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Late fees: <span className="text-orange-500">₹{mockData.lateFeesTotal}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{mockData.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <UserCheck className="h-5 w-5 text-blue-500" />
              Today's Check-ins
            </CardTitle>
            <CardDescription>Member activity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Morning (6AM-12PM)
                    </p>
                    <p className="text-2xl font-bold">
                      {mockData.todayCheckins.morning}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Evening (6PM-11PM)
                    </p>
                    <p className="text-2xl font-bold">
                      {mockData.todayCheckins.evening}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Morning Progress</span>
                    <span>{mockData.todayCheckins.morning}%</span>
                  </div>
                  <Progress value={mockData.todayCheckins.morning} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Evening Progress</span>
                    <span>{mockData.todayCheckins.evening}%</span>
                  </div>
                  <Progress value={mockData.todayCheckins.evening} />
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Check-ins</span>
                    <Badge variant="outline">
                      {mockData.todayCheckins.morning + mockData.todayCheckins.evening}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Hour</span>
                    <Badge className="bg-green-100 text-green-700">
                      8 PM (85 members)
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity Utilization</span>
                    <Badge variant="outline">78%</Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Revenue Overview
            </CardTitle>
            <CardDescription>
              Monthly revenue vs pending amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" radius={6} />
                <Bar dataKey="pending" fill="#3b82f6" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours Analysis */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-blue-500" />
                Peak Hours Analysis
              </CardTitle>
              <CardDescription>
                Member check-in patterns throughout the day
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={peakHoursView === "morning" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeakHoursView("morning")}
                className={
                  peakHoursView === "morning" ? "bg-green-500 text-white" : ""
                }
              >
                Morning
              </Button>
              <Button
                variant={peakHoursView === "evening" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeakHoursView("evening")}
                className={
                  peakHoursView === "evening" ? "bg-blue-500 text-white" : ""
                }
              >
                Evening
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData.peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={peakHoursView}
                stroke={peakHoursView === "morning" ? "#22c55e" : "#3b82f6"}
                strokeWidth={3}
                dot={{
                  fill: peakHoursView === "morning" ? "#22c55e" : "#3b82f6",
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
