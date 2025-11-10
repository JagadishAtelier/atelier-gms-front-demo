import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Download,
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
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
  Area,
} from 'recharts';

// ====== Dummy Data ======
const membershipGrowthData = [
  { month: 'Jan', newMembers: 28, totalMembers: 180, revenue: 24000 },
  { month: 'Feb', newMembers: 32, totalMembers: 212, revenue: 28500 },
  { month: 'Mar', newMembers: 25, totalMembers: 237, revenue: 32000 },
  { month: 'Apr', newMembers: 35, totalMembers: 272, revenue: 36500 },
  { month: 'May', newMembers: 29, totalMembers: 301, revenue: 40000 },
  { month: 'Jun', newMembers: 31, totalMembers: 332, revenue: 44500 },
];

const retentionData = [
  { period: '1 Month', rate: 95 },
  { period: '3 Months', rate: 87 },
  { period: '6 Months', rate: 75 },
  { period: '12 Months', rate: 68 },
  { period: '24 Months', rate: 45 },
];

const revenueBreakdown = [
  { name: 'Membership Fees', value: 75, color: '#22c55e' },
  { name: 'Personal Training', value: 15, color: '#3b82f6' },
  { name: 'Classes', value: 7, color: '#f97316' },
  { name: 'Merchandise', value: 3, color: '#a855f7' },
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
  { time: '10 PM', morning: 8, evening: 52 },
];

const monthlyRevenueData = [
  { month: 'Jan', membership: 24000, training: 4500, classes: 1200, other: 800 },
  { month: 'Feb', membership: 28500, training: 5200, classes: 1400, other: 900 },
  { month: 'Mar', membership: 32000, training: 6100, classes: 1600, other: 1200 },
  { month: 'Apr', membership: 36500, training: 6800, classes: 1800, other: 1400 },
  { month: 'May', membership: 40000, training: 7500, classes: 2000, other: 1500 },
  { month: 'Jun', membership: 44500, training: 8200, classes: 2200, other: 1800 },
];

// ====== Main Component ======
export function Reports() {
  const [dateRange, setDateRange] = useState('6months');
  const [peakHoursView, setPeakHoursView] = useState('morning');

  const totalRevenue = monthlyRevenueData[monthlyRevenueData.length - 1];
  const monthlyTotal =
    totalRevenue.membership +
    totalRevenue.training +
    totalRevenue.classes +
    totalRevenue.other;

  return (
    <div className="space-y-6 p-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your gym’s performance
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select range" />
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

      {/* ===== Key Metrics ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${monthlyTotal.toLocaleString()}`}
          subtitle="+12.5% from last month"
          icon={<IndianRupee className="h-4 w-4 text-green-500" />}
          color="text-green-500"
        />
        <MetricCard
          title="Active Members"
          value="332"
          subtitle="+31 this month"
          icon={<Users className="h-4 w-4 text-blue-500" />}
          color="text-blue-500"
        />
        <MetricCard
          title="Retention Rate"
          value="87%"
          subtitle="3-month retention"
          icon={<Target className="h-4 w-4 text-purple-500" />}
          color="text-purple-500"
        />
        <MetricCard
          title="Avg. Revenue per Member"
          value={`₹${Math.round(monthlyTotal / 332)}`}
          subtitle="+5.2% improvement"
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
          color="text-orange-500"
        />
      </div>

      {/* ===== Tabs Section ===== */}
      <Tabs defaultValue="membership" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* ===== Membership ===== */}
        <TabsContent value="membership" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Membership Growth"
              description="New member acquisition over time"
              icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            >
              <AreaChartComponent data={membershipGrowthData} dataKey="newMembers" color="#22c55e" />
            </ChartCard>

            <ChartCard
              title="Total Members Growth"
              description="Cumulative member count progression"
              icon={<Users className="h-5 w-5 text-blue-500" />}
            >
              <LineChartComponent data={membershipGrowthData} dataKey="totalMembers" color="#3b82f6" />
            </ChartCard>
          </div>
        </TabsContent>

        {/* ===== Revenue ===== */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Monthly Revenue Breakdown"
              description="Revenue by category over time"
              icon={<BarChart3 className="h-5 w-5 text-green-500" />}
            >
              <BarChartComponent data={monthlyRevenueData} />
            </ChartCard>

            <ChartCard
              title="Revenue Distribution"
              description="Current month revenue breakdown"
              icon={<PieChart className="h-5 w-5 text-purple-500" />}
            >
              <PieChartComponent data={revenueBreakdown} />
            </ChartCard>
          </div>
        </TabsContent>

        {/* ===== Retention ===== */}
        <TabsContent value="retention" className="space-y-6">
          <ChartCard
            title="Member Retention Analysis"
            description="Retention rates by membership duration"
            icon={<Target className="h-5 w-5 text-purple-500" />}
          >
            <RetentionChart data={retentionData} />
          </ChartCard>
        </TabsContent>

        {/* ===== Attendance ===== */}
        <TabsContent value="attendance" className="space-y-6">
          <ChartCard
            title="Peak Hours Analysis"
            description="Member check-in patterns throughout the day"
            icon={<Activity className="h-5 w-5 text-blue-500" />}
          >
            <PeakHoursChart data={peakHoursData} view={peakHoursView} setView={setPeakHoursView} />
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ====== Helper Components ======
const MetricCard = ({ title, value, subtitle, icon, color }) => (
  <Card className="border-border/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, description, icon, children }) => (
  <Card className="border-border/50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// ===== Chart Components =====
const AreaChartComponent = ({ data, dataKey, color }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.3} />
    </AreaChart>
  </ResponsiveContainer>
);

const LineChartComponent = ({ data, dataKey, color }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot />
    </LineChart>
  </ResponsiveContainer>
);

const BarChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="membership" stackId="a" fill="#22c55e" />
      <Bar dataKey="training" stackId="a" fill="#3b82f6" />
      <Bar dataKey="classes" stackId="a" fill="#f97316" />
      <Bar dataKey="other" stackId="a" fill="#a855f7" />
    </BarChart>
  </ResponsiveContainer>
);

const PieChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <RechartsPieChart>
      <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </RechartsPieChart>
  </ResponsiveContainer>
);

const RetentionChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} layout="horizontal">
      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
      <XAxis type="number" domain={[0, 100]} />
      <YAxis dataKey="period" type="category" />
      <Tooltip />
      <Bar dataKey="rate" fill="#22c55e" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

const PeakHoursChart = ({ data, view, setView }) => (
  <div>
    <div className="flex gap-2 mb-4">
      <Button
        variant={view === 'morning' ? 'default' : 'outline'}
        onClick={() => setView('morning')}
        className={view === 'morning' ? 'bg-green-500 text-white' : ''}
      >
        Morning
      </Button>
      <Button
        variant={view === 'evening' ? 'default' : 'outline'}
        onClick={() => setView('evening')}
        className={view === 'evening' ? 'bg-blue-500 text-white' : ''}
      >
        Evening
      </Button>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey={view}
          stroke={view === 'morning' ? '#22c55e' : '#3b82f6'}
          fill={view === 'morning' ? '#22c55e' : '#3b82f6'}
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default Reports;
