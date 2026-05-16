'use client';
import { Icon } from '@/components/ui/Icon';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function RevenueCharts({ planRevData, tierBarData }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            {/* Revenue Breakdown Pie */}
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: 24, }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}><Icon name="Star" size={16} /> Revenue by Plan</h3>
                <div style={{ height: 220, display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={planRevData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ₹${value}`}>
                                {planRevData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ border: '1px solid rgba(255,255,255,0.1)', }} formatter={(v) => `₹${v}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* User Tier Bar Chart */}
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: 24, }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}><Icon name="BarChart2" /> Users by Plan</h3>
                <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tierBarData}>
                            <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ border: '1px solid rgba(255,255,255,0.1)', }} />
                            <Bar dataKey="users" radius={[8, 8, 0, 0]}>
                                {tierBarData.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
