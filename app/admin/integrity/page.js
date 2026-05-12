'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
import { ShieldAlert, Activity, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function IntegrityDashboard() {
    const [data, setData] = useState({
        errorLogs: [],
        webhookFailures: 0,
        orphanedTests: 0,
        cronFailures: 0,
        notificationMetrics: { sent: 0, failed: 0, openRate: 0 },
        loading: true
    });

    useEffect(() => {
        async function fetchIntegrityMetrics() {
            try {
                // 1. Fetch recent DB utility errors
                const { data: errors } = await supabase
                    .from('error_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                // 2. Fetch failed webhooks (from payments or dedicated log)
                // For simple v1, we check payments that are pending for > 24 hours
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                const { count: failedWebhooks } = await supabase
                    .from('payments')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'failed')
                    .gte('created_at', yesterday.toISOString());

                // 3. Detect orphaned tests (Tests completed but 0 answers attached)
                // We'll run a quick proxy: how many test_answers exist vs tests
                // (True orphan detection requires a SQL view or RPC, doing a proxy for v1)
                const { count: totalTests } = await supabase.from('tests').select('*', { count: 'exact', head: true }).not('completed_at', 'is', null);
                
                // 4. Check Cron failures (if any registered in error logs)
                const { count: crons } = await supabase
                    .from('error_logs')
                    .select('*', { count: 'exact', head: true })
                    .ilike('route', '%cron%')
                    .gte('created_at', yesterday.toISOString());

                // 5. Notification Metrics (last 24h)
                const { count: notifSent } = await supabase.from('notifications_log').select('*', { count: 'exact', head: true }).eq('delivery_status', 'sent').gte('created_at', yesterday.toISOString());
                const { count: notifFailed } = await supabase.from('notifications_log').select('*', { count: 'exact', head: true }).eq('delivery_status', 'failed').gte('created_at', yesterday.toISOString());
                const { count: notifOpened } = await supabase.from('notifications_log').select('*', { count: 'exact', head: true }).eq('delivery_status', 'opened').gte('created_at', yesterday.toISOString());
                const { count: notifActioned } = await supabase.from('notifications_log').select('*', { count: 'exact', head: true }).eq('delivery_status', 'action_completed').gte('created_at', yesterday.toISOString());

                const openRate = notifSent > 0 ? Math.round(((notifOpened + notifActioned) / notifSent) * 100) : 0;

                setData({
                    errorLogs: errors || [],
                    webhookFailures: failedWebhooks || 0,
                    orphanedTests: 'N/A (Requires RPC)', 
                    cronFailures: crons || 0,
                    notificationMetrics: { sent: notifSent || 0, failed: notifFailed || 0, openRate },
                    loading: false
                });

            } catch (e) {
                console.error("Failed to load integrity metrics", e);
                setData(prev => ({ ...prev, loading: false }));
            }
        }
        fetchIntegrityMetrics();
    }, []);

    if (data.loading) return <div className="p-8 text-white">Loading Integrity Metrics...</div>;

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-gray-100">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ShieldAlert className="text-red-500" />
                    Data Integrity & Operations Monitor
                </h1>
                <p className="text-gray-400 mt-2">V1 Dashboard tracking silent failures, schema drift, and unhandled DB exceptions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard 
                    title="Failed Transactions (24h)" 
                    value={data.errorLogs.filter(e => new Date(e.created_at) > new Date(Date.now() - 86400000)).length} 
                    icon={<Database />}
                    status={data.errorLogs.length > 0 ? 'danger' : 'safe'}
                />
                <MetricCard 
                    title="Webhook / Payment Anomalies" 
                    value={data.webhookFailures} 
                    icon={<Activity />}
                    status={data.webhookFailures > 0 ? 'warning' : 'safe'}
                />
                <MetricCard 
                    title="Cron Failures (24h)" 
                    value={data.cronFailures} 
                    icon={<AlertCircle />}
                    status={data.cronFailures > 0 ? 'danger' : 'safe'}
                />
                <MetricCard 
                    title="Nudge Failures (24h)" 
                    value={`${data.notificationMetrics.failed} (${data.notificationMetrics.openRate}% open rate)`} 
                    icon={<AlertCircle />}
                    status={data.notificationMetrics.failed > 0 ? 'warning' : 'safe'}
                />
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Recent Database Exceptions</h2>
                {data.errorLogs.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-400 py-4">
                        <CheckCircle2 /> No recent exceptions found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-gray-400 bg-gray-700/50">
                                <tr>
                                    <th className="p-3">Timestamp</th>
                                    <th className="p-3">Route</th>
                                    <th className="p-3">Error</th>
                                    <th className="p-3">User ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {data.errorLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="p-3 text-gray-300">{new Date(log.created_at).toLocaleString()}</td>
                                        <td className="p-3 font-mono text-xs text-blue-400">{log.route}</td>
                                        <td className="p-3 text-red-400 truncate max-w-xs" title={log.error_message}>{log.error_message}</td>
                                        <td className="p-3 text-gray-400 text-xs truncate max-w-[100px]">{log.user_id || 'System'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, status }) {
    const colors = {
        safe: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        danger: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return (
        <div className={`rounded-xl p-6 border flex items-center gap-4 ${colors[status]}`}>
            <div className="p-3 rounded-lg bg-black/20">
                {icon}
            </div>
            <div>
                <p className="text-sm opacity-80 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold">{value}</h3>
            </div>
        </div>
    );
}
