import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Download, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const membershipGrowthData = [
  { month: 'Jan', newMembers: 28, totalMembers: 180, revenue: 24000 },
  { month: 'Feb', newMembers: 32, totalMembers: 212, revenue: 28500 },
  { month: 'Mar', newMembers: 25, totalMembers: 237, revenue: 32000 },
  { month: 'Apr', newMembers: 35, totalMembers: 272, revenue: 36500 },
  { month: 'May', newMembers: 29, totalMembers: 301, revenue: 40000 },
  { month: 'Jun', newMembers: 31, totalMembers: 332, revenue: 44500 }
];

const retentionData = [
  { period: '1 Month', rate: 95 },
  { period: '3 Months', rate: 87 },
  { period: '6 Months', rate: 75 },
  { period: '12 Months', rate: 68 },
  { period: '24 Months', rate: 45 }
];

const revenueBreakdown = [
  { name: 'Membership Fees', value: 75, color: 'hsl(var(--neon-green))' },
  { name: 'Personal Training', value: 15, color: 'hsl(var(--neon-blue))' },
  { name: 'Classes', value: 7, color: 'hsl(var(--chart-3))' },
  { name: 'Merchandise', value: 3, color: 'hsl(var(--chart-4))' }
];

const peakHoursData = [
  { time: '6 AM', morning: 45, evening: 12 },
  { time: '7 AM', morning: 67, evening: 18 },
  { time: '8 AM', morning: 89, evening: 25 },
  { time: '9 AM', morning: 72, evening: 30 },
  { time: '10 AM', morning: 56, evening: 35 },
  { time: '11 AM', morning: 41, evening: 28 },
  { time: '6 PM', morning: 25, evening: 78 },
  { time: '7 PM', morning: 20, evening: 95 },
  { time: '8 PM', morning: 15, evening: 110 },
  { time: '9 PM', morning: 12, evening: 87 },
  { time: '10 PM', morning: 8, evening: 52 }
];

const monthlyRevenueData = [
  { month: 'Jan', membership: 24000, training: 4500, classes: 1200, other: 800 },
  { month: 'Feb', membership: 28500, training: 5200, classes: 1400, other: 900 },
  { month: 'Mar', membership: 32000, training: 6100, classes: 1600, other: 1200 },
  { month: 'Apr', membership: 36500, training: 6800, classes: 1800, other: 1400 },
  { month: 'May', membership: 40000, training: 7500, classes: 2000, other: 1500 },
  { month: 'Jun', membership: 44500, training: 8200, classes: 2200, other: 1800 }
];

export function Reports() {
  const [dateRange, setDateRange] = useState('6months');
  const [peakHoursView, setPeakHoursView] = useState<'morning' | 'evening'>('morning');

  const totalRevenue = monthlyRevenueData[monthlyRevenueData.length - 1];
  const monthlyTotal = totalRevenue.membership + totalRevenue.training + totalRevenue.classes + totalRevenue.other;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your gym's performance</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-neon-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${monthlyTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-neon-green">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Members</CardTitle>
            <Users className="h-4 w-4 text-neon-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">332</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-neon-blue">+31</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Retention Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-400">87%</div>
            <p className="text-xs text-muted-foreground">
              3-month retention
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg. Revenue per Member</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-400">${Math.round(monthlyTotal / 332)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-400">+5.2%</span> improvement
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="membership" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="membership" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-neon-green" />
                  Membership Growth
                </CardTitle>
                <CardDescription>New member acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={membershipGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="newMembers" 
                      stroke="hsl(var(--neon-green))" 
                      fill="hsl(var(--neon-green))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-neon-blue" />
                  Total Members Growth
                </CardTitle>
                <CardDescription>Cumulative member count progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={membershipGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalMembers" 
                      stroke="hsl(var(--neon-blue))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--neon-blue))', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-neon-green" />
                  Monthly Revenue Breakdown
                </CardTitle>
                <CardDescription>Revenue by category over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="membership" stackId="a" fill="hsl(var(--neon-green))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="training" stackId="a" fill="hsl(var(--neon-blue))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="classes" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="other" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-400" />
                  Revenue Distribution
                </CardTitle>
                <CardDescription>Current month revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {revenueBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Member Retention Analysis
              </CardTitle>
              <CardDescription>Retention rates by membership duration</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={retentionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="period" type="category" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="rate" fill="hsl(var(--neon-green))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-red-400">5.2%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly member churn
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg. Membership Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-neon-blue">14.2 months</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Before cancellation
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Member Lifetime Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-neon-green">$1,847</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average per member
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-neon-blue" />
                    Peak Hours Analysis
                  </CardTitle>
                  <CardDescription>Member check-in patterns throughout the day</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={peakHoursView === 'morning' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeakHoursView('morning')}
                    className={peakHoursView === 'morning' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                  >
                    Morning
                  </Button>
                  <Button
                    variant={peakHoursView === 'evening' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeakHoursView('evening')}
                    className={peakHoursView === 'evening' ? 'bg-purple-500 hover:bg-purple-600 text-white' : ''}
                  >
                    Evening
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey={peakHoursView} 
                    stroke={peakHoursView === 'morning' ? '#f97316' : '#a855f7'} 
                    fill={peakHoursView === 'morning' ? '#f97316' : '#a855f7'}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Peak Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-neon-green">8 PM</div>
                <p className="text-xs text-muted-foreground mt-1">
                  110 average check-ins
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-neon-blue">187 visits</div>
                <p className="text-xs text-muted-foreground mt-1">
                  56% capacity utilization
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Weekend vs Weekday</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-purple-400">+23%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher weekend attendance
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}