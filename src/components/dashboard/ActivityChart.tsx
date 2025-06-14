
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityChartProps {
  data?: Array<{ name: string; documents: number }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
  // Generate default empty data for the last 7 months if no data provided
  const defaultData = [
    { name: 'Jan', documents: 0 },
    { name: 'Feb', documents: 0 },
    { name: 'Mar', documents: 0 },
    { name: 'Apr', documents: 0 },
    { name: 'May', documents: 0 },
    { name: 'Jun', documents: 0 },
    { name: 'Jul', documents: 0 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorDocuments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3a86ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3a86ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: 'none',
            }}
          />
          <Area
            type="monotone"
            dataKey="documents"
            stroke="#3a86ff"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDocuments)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
