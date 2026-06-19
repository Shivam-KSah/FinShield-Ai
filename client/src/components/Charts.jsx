import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
  blue: '#3b82f6',
  cyan: '#06b6d4',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-active)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TransactionVolumeChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="_id" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone" dataKey="count" name="Transactions"
          stroke={COLORS.blue} strokeWidth={2.5}
          dot={{ fill: COLORS.blue, r: 4 }}
          activeDot={{ r: 6, fill: COLORS.cyan }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RiskDistributionChart({ data = [] }) {
  const labels = ['Low (0-30)', 'Medium (30-60)', 'High (60-80)', 'Critical (80-100)'];
  const chartColors = [COLORS.low, COLORS.medium, COLORS.high, COLORS.critical];

  const formatted = data.map((d, i) => ({
    name: labels[i] || `Range ${i}`,
    value: d.count,
    color: chartColors[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={formatted} cx="50%" cy="50%"
          innerRadius={55} outerRadius={85}
          paddingAngle={4} dataKey="value"
        >
          {formatted.map((entry, index) => (
            <Cell key={index} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-active)',
            borderRadius: 10,
            fontSize: '0.8rem',
          }}
          itemStyle={{ color: 'var(--text-primary)' }}
          labelStyle={{ color: 'var(--text-secondary)' }}
        />
        <Legend
          iconType="circle" iconSize={8}
          formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AmountBarChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="_id" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="amount" name="Volume (₹)" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
