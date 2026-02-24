"use client";

import { useState } from "react";
import {
    Download, FileText, Calendar, Filter,
    FileSpreadsheet, FileJson, Loader2, CheckCircle2,
    ArrowRight, Info, History, Trash2, Search,
    Activity, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

export default function ExportCenterPage() {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [exportFormat, setExportFormat] = useState("csv");

    const startExport = async () => {
        setIsExporting(true);
        setProgress(0);

        // Progress simulation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);

        await new Promise(r => setTimeout(r, 3500));

        toast({
            title: "Export Ready ✅",
            description: `Your ${exportFormat.toUpperCase()} file is ready for download.`,
        });
        setIsExporting(false);
    };

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Export Center</h1>
                    <p className="text-slate-400 font-medium">Generate compliance and audit reports for your issued proofs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Export Configuration */}
                <Card className="md:col-span-2 bg-slate-900/40 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-400" /> Report Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Report Data Source</label>
                                    <Select defaultValue="issued">
                                        <SelectTrigger className="bg-slate-950/50 border-white/10 text-white h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            <SelectItem value="issued">Issued Credentials Registry</SelectItem>
                                            <SelectItem value="logs">Verification Access Logs</SelectItem>
                                            <SelectItem value="audit">System Audit Trail</SelectItem>
                                            <SelectItem value="keys">Key Rotation History</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Date Range</label>
                                    <Select defaultValue="30d">
                                        <SelectTrigger className="bg-slate-950/50 border-white/10 text-white h-11">
                                            <Calendar className="w-3.5 h-3.5 mr-2" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            <SelectItem value="7d">Last 7 Days</SelectItem>
                                            <SelectItem value="30d">Last 30 Days</SelectItem>
                                            <SelectItem value="q1">Q1 Report (Jan-Mar)</SelectItem>
                                            <SelectItem value="custom">Custom Range...</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Filter by Type</label>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="bg-slate-950/50 border-white/10 text-white h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            <SelectItem value="all">All Credential Types</SelectItem>
                                            <SelectItem value="Age">Age Verification only</SelectItem>
                                            <SelectItem value="Identity">National Identity only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Select Export Format</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => setExportFormat("csv")}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${exportFormat === "csv" ? "bg-blue-600/10 border-blue-500/50 text-white" : "bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                                            <span className="font-bold text-sm">Comma Separated (CSV)</span>
                                        </div>
                                        {exportFormat === "csv" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                                    </button>
                                    <button
                                        onClick={() => setExportFormat("xlsx")}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${exportFormat === "xlsx" ? "bg-blue-600/10 border-blue-500/50 text-white" : "bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                            <span className="font-bold text-sm">Excel Spreadsheet (.xlsx)</span>
                                        </div>
                                        {exportFormat === "xlsx" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                                    </button>
                                    <button
                                        onClick={() => setExportFormat("pdf")}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${exportFormat === "pdf" ? "bg-blue-600/10 border-blue-500/50 text-white" : "bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-rose-500" />
                                            <span className="font-bold text-sm">PDF Compliance Report</span>
                                        </div>
                                        {exportFormat === "pdf" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-6">
                            {isExporting && (
                                <div className="space-y-2 animate-in fade-in duration-500 text-center">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                        <span>Generating Data View...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2 bg-slate-950" />
                                </div>
                            )}

                            <Button
                                onClick={startExport}
                                disabled={isExporting}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-blue-500/20 text-lg"
                            >
                                {isExporting ? <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Processing Engine...</> : <><Download className="w-5 h-5 mr-3" /> Generate & Download Report</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info & Side */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white text-md font-bold uppercase tracking-widest opacity-60">Export History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                                            <History className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">Q1_Revenue_Logic.csv</p>
                                            <p className="text-[9px] text-slate-600 font-mono">15 Feb 2026 · 1.2MB</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-500 hover:text-white transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-slate-500 hover:text-white">View Full History</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-600/5 border-blue-500/20">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <ShieldCheck className="w-10 h-10 text-blue-500 shrink-0" />
                                <div>
                                    <p className="text-white font-bold text-sm">Regulatory Ready</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">Generated reports are signed with your Node Fingerprint to ensure integrity for regulatory filing.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
