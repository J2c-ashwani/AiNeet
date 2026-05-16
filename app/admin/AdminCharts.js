'use client';
import { Icon } from '@/components/ui/Icon';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminCharts({ chartData, pieData, totalSubs }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
            {/* Activity Chart */}
            <div style={{
                border: '1px solid rgba(255,255,255,0.08)',
                padding: 24, }}>
                <h3 style={{ fontWeight: 700, marginBottom: 24, }}><Icon name="TrendingUp" /> Test Activity (Last 7 Days)</h3>
                <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ border: '1px solid rgba(255,255,255,0.1)', }}
                                labelStyle={{ }}
                            />
                            <Area type="monotone" dataKey="tests" stroke="#6366f1" strokeWidth={2} fill="url(#colorTests)" name="Tests" />
                            <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} fill="url(#colorAccuracy)" name="Avg Accuracy %" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Subscription Breakdown */}
            <div style={{
                border: '1px solid rgba(255,255,255,0.08)',
                padding: 24, }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, }}><Icon name="BarChart2" /> User Plans</h3>
                <div style={{ height: 180, display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ border: '1px solid rgba(255,255,255,0.1)', }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                    {pieData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, }}>
                            <div style={{ width: 10, height: 10, background: d.color }}></div>
                            <span >{d.name} ({d.value})</span>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, }}>{totalSubs}</p>
                    <p style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</p>
                </div>
            </div>
        </div>
    );
}
