"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

type ChartColors = "primary" | "emerald" | "amber" | "sky" | "violet" | "rose";

const CHART_COLORS: Record<ChartColors, string> = {
  primary: "hsl(var(--primary))",
  emerald: "#10b981",
  amber: "#f59e0b",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
  rose: "#f43f5e",
};

const PIE_COLORS = [
  "hsl(var(--primary))",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#f43f5e",
  "#6366f1",
  "#ec4899",
];

interface BaseChartProps {
  className?: string;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

// ============ BAR CHART ============

interface BarChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface StatsBarChartProps extends BaseChartProps {
  data: BarChartData[];
  color?: ChartColors;
  valueFormatter?: (value: number) => string;
  layout?: "horizontal" | "vertical";
}

export function StatsBarChart({
  data,
  color = "primary",
  valueFormatter = (v) => v.toString(),
  layout = "horizontal",
  className,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
}: StatsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={layout === "vertical"}
          />
        )}
        {showXAxis && (
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
        )}
        {showYAxis && (
          <YAxis
            tickFormatter={valueFormatter}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            width={50}
          />
        )}
        <Tooltip
          formatter={valueFormatter}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
        />
        <Bar
          dataKey="value"
          fill={CHART_COLORS[color]}
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============ AREA CHART ============

interface AreaChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface StatsAreaChartProps extends BaseChartProps {
  data: AreaChartData[];
  color?: ChartColors;
  valueFormatter?: (value: number) => string;
  fillOpacity?: number;
  showLegend?: boolean;
}

export function StatsAreaChart({
  data,
  color = "primary",
  valueFormatter = (v) => v.toString(),
  fillOpacity = 0.3,
  showLegend = false,
  className,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
}: StatsAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS[color]} stopOpacity={fillOpacity} />
            <stop offset="95%" stopColor={CHART_COLORS[color]} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />
        )}
        {showXAxis && (
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
        )}
        {showYAxis && (
          <YAxis
            tickFormatter={valueFormatter}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            width={50}
          />
        )}
        <Tooltip
          formatter={valueFormatter}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        {showLegend && <Legend />}
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS[color]}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============ PIE CHART ============

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface StatsPieChartProps {
  data: PieChartData[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
}

export function StatsPieChart({
  data,
  valueFormatter = (v) => v.toString(),
  showLegend = true,
  className,
  innerRadius = 0,
  outerRadius = 80,
}: StatsPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={valueFormatter}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        {showLegend && (
          <Legend
            formatter={(value) => (
              <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
            )}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

// ============ LINE CHART ============

interface LineChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface StatsLineChartProps extends BaseChartProps {
  data: LineChartData[];
  color?: ChartColors;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showDots?: boolean;
}

export function StatsLineChart({
  data,
  color = "primary",
  valueFormatter = (v) => v.toString(),
  showLegend = false,
  showDots = true,
  className,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
}: StatsLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />
        )}
        {showXAxis && (
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
        )}
        {showYAxis && (
          <YAxis
            tickFormatter={valueFormatter}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            width={50}
          />
        )}
        <Tooltip
          formatter={valueFormatter}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS[color]}
          strokeWidth={2}
          dot={showDots ? { fill: CHART_COLORS[color], strokeWidth: 0, r: 4 } : false}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ============ RADIAL BAR CHART ============

interface RadialBarData {
  name: string;
  value: number;
  fill: string;
}

interface StatsRadialBarChartProps {
  data: RadialBarData[];
  valueFormatter?: (value: number) => string;
  className?: string;
  width?: number;
  height?: number;
}

export function StatsRadialBarChart({
  data,
  valueFormatter = (v) => `${v}%`,
  className,
}: StatsRadialBarChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <PieChart width={200} height={200}>
          <Pie
            data={[{ value: 100 }]}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={70}
            outerRadius={90}
            fill="hsl(var(--muted))"
            stroke="none"
            dataKey="value"
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={70}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{valueFormatter(total)}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs text-muted-foreground">
              {item.name}: {valueFormatter(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MINI CHART (Small sparkline) ============

interface MiniChartProps {
  data: number[];
  color?: ChartColors;
  className?: string;
}

export function MiniChart({
  data,
  color = "primary",
  className,
}: MiniChartProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height={40} className={className}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`mini-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS[color]} stopOpacity={0.4} />
            <stop offset="95%" stopColor={CHART_COLORS[color]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS[color]}
          strokeWidth={1.5}
          fill={`url(#mini-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
