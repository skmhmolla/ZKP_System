"use client";

import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart,
    Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import {
    Activity, TrendingUp, Users, ShieldCheck,
    Calendar, ArrowUpRight, ArrowDownRight, Filter,
    Download, RefreshCcw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const volumeData = [
    { name: "Mon", issued: 45, verified: 120 },
    { name: "Tue", issued: 52, verified: 145 },
    { name: "Wed", issued: 48, verified: 132 },
    { name: "Thu", issued: 61, verified: 180 },
    { name: "Fri", issued: 55, verified: 165 },
    { name: "Sat", issued: 32, verified: 90 },
    { name: "Sun", issued: 28, verified: 75 },
];

const segmentData = [
    { name: "Age 18+", value: 400, color: "#3B82F6" },
    { name: "Identity", value: 300, color: "#8B5CF6" },
    { name: "VIP Pass", value: 200, color: "#14B8A6" },
    { name: "Health", value: 100, color: "#F59E0B" },
];

const nodeLoadData = [
    { node: "London-01", load: 78 },
    { node: "NYC-02", load: 82 },
    { node: "Tokyo-01", load: 45 },
    { node: "SG-03", load: 61 },
    { node: "Berlin-01", load: 55 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">System Analytics</h1>
                    <p className="text-slate-400 font-medium">Global performance benchmarks and issuance metrics.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-slate-900 shadow-xl border-white/10 text-slate-400 font-bold gap-2">
                        <Calendar className="w-4 h-4" /> This Month
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 shadow-lg shadow-blue-500/20">
                        <RefreshCcw className="w-4 h-4" /> Refresh Data
                    </Button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Verification Latency</p>
                                <h3 className="text-3xl font-black text-white italic tracking-tighter">42ms</h3>
                                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <ArrowDownRight className="w-3 h-3" /> 12% faster than last week
                                </p>
                            </div>
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Node Uptime</p>
                                <h3 className="text-3xl font-black text-white italic tracking-tighter">99.99%</h3>
                                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> SLA Compliant
                                </p>
                            </div>
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Active Holders</p>
                                <h3 className="text-3xl font-black text-white italic tracking-tighter">8,291</h3>
                                <p className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> +242 this month
                                </p>
                            </div>
                            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white text-lg font-bold tracking-tight">Traffic Breakdown</CardTitle>
                        <CardDescription className="text-slate-500">Correlation between issuance and verification hits.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={volumeData}>
                                <defs>
                                    <linearGradient id="c_verified" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                                />
                                <Area type="monotone" dataKey="verified" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#c_verified)" />
                                <Line type="monotone" dataKey="issued" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4, fill: '#020617', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white text-lg font-bold tracking-tight">Regional Node Utilization</CardTitle>
                        <CardDescription className="text-slate-500">Current compute load per validator node.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={nodeLoadData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="node" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                                />
                                <Bar dataKey="load" radius={[0, 8, 8, 0]} barSize={24}>
                                    {nodeLoadData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.load > 70 ? "#F43F5E" : "#3B82F6"} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white text-lg font-bold tracking-tight">Compliance Distribution</CardTitle>
                        <CardDescription className="text-slate-500">Verification segments by regulatory category.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={segmentData}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {segmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                                />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ paddingLeft: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Growth Insights */}
                <div className="space-y-6">
                    <Card className="bg-blue-600/5 border-blue-500/10">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                    <Filter className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-black text-sm uppercase italic tracking-widest">Optimized Query Routing</h4>
                                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                        Your network is automatically routing 82% of verification requests to localized edge nodes, resulting in a **12.4ms speed improvement**.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-white/10 group cursor-pointer hover:border-blue-500/30 transition-all">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-blue-600/10 transition-colors">
                                    <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Download Monthly Insights</p>
                                    <p className="text-[10px] text-slate-500 font-mono">PDF · Last generated: 2h ago</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-slate-700 group-hover:text-blue-400 transform transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
