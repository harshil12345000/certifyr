
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', documents: 20 },
  { name: 'Feb', documents: 35 },
  { name: 'Mar', documents: 45 },
  { name: 'Apr', documents: 30 },
  { name: 'May', documents: 49 },
  { name: 'Jun', documents: 62 },
  { name: 'Jul', documents: 78 },
];

export function ActivityChart() {
  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-medium mb-4">Document Activity</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
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
    </div>
  );
}
