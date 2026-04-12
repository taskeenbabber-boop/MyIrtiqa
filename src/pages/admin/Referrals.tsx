import { useState, useEffect, useMemo } from "react";
import { Link2, Users, DollarSign, TrendingUp, Download, Copy, CheckCircle, Loader2, Search, ChevronDown, ChevronUp, Plus, X, Ban, Eye, Percent, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const DISCOUNT_OPTIONS = ["registration", "pitch", "poster", "quiz", "drill", "debate"];
const TABLES = [
    { key: "registrations", table: "symposium_registrations", label: "Registrations" },
    { key: "pitch", table: "symposium_pitch_submissions", label: "Pitch" },
    { key: "poster", table: "symposium_poster_submissions", label: "Poster" },
    { key: "quiz", table: "symposium_quiz_submissions", label: "Quiz" },
    { key: "drill", table: "symposium_drill_submissions", label: "Drill" },
    { key: "debate", table: "symposium_debate_submissions", label: "Debate" },
    { key: "meme", table: "symposium_meme_submissions", label: "Meme" },
] as const;

interface RefCode { id: string; code: string; name: string; type: string; institution: string; discount_percent: number; discount_applies_to: string[]; active: boolean; created_at: string; }
interface ReferralRow { referral_code: string | null; status: string; total_amount?: number; }

export default function AdminReferrals() {
    const [loading, setLoading] = useState(true);
    const [codes, setCodes] = useState<RefCode[]>([]);
    const [allData, setAllData] = useState<Record<string, ReferralRow[]>>({});
    const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCode, setExpandedCode] = useState<string | null>(null);
    const [showAllLinks, setShowAllLinks] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<string | null>(null);
    const [discountValue, setDiscountValue] = useState(0);
    const [discountTargets, setDiscountTargets] = useState<string[]>([]);
    const [newCode, setNewCode] = useState({ name: "", type: "ambassador", institution: "", codeOverride: "" });

    const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/ai-symposium` : "https://myirtiqa.com/ai-symposium";

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const { data: codesData } = await (supabase as any).from("symposium_referral_codes").select("*").order("created_at", { ascending: true });
            setCodes(codesData || []);
            const { data: visitsData } = await (supabase as any).from("symposium_referral_visits").select("referral_code");
            const vc: Record<string, number> = {};
            (visitsData || []).forEach((v: any) => { vc[v.referral_code] = (vc[v.referral_code] || 0) + 1; });
            setVisitCounts(vc);
            const results: Record<string, ReferralRow[]> = {};
            await Promise.all(TABLES.map(async (t) => {
                const { data } = await (supabase as any).from(t.table).select("referral_code, status, total_amount").not("referral_code", "is", null);
                results[t.key] = (data || []).filter((r: ReferralRow) => r.referral_code && r.referral_code.trim() !== "");
            }));
            setAllData(results);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const stats = useMemo(() => codes.map(c => {
        let total = 0, approved = 0, pending = 0, rejected = 0, revenue = 0;
        const breakdown: Record<string, number> = {};
        TABLES.forEach(t => {
            const rows = (allData[t.key] || []).filter(r => r.referral_code === c.code);
            if (rows.length > 0) { breakdown[t.label] = rows.length; total += rows.length; }
            rows.forEach(r => {
                if (r.status === "approved") { approved++; revenue += r.total_amount || 0; }
                else if (r.status === "rejected") rejected++; else pending++;
            });
        });
        return { ...c, total, approved, pending, rejected, revenue, breakdown, visits: visitCounts[c.code] || 0 };
    }), [codes, allData, visitCounts]);

    const filteredStats = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return (q ? stats.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) : stats).sort((a, b) => b.total - a.total);
    }, [stats, searchQuery]);

    const globalTotals = useMemo(() => stats.reduce((a, s) => ({
        total: a.total + s.total, approved: a.approved + s.approved, pending: a.pending + s.pending, revenue: a.revenue + s.revenue, visits: a.visits + s.visits,
    }), { total: 0, approved: 0, pending: 0, revenue: 0, visits: 0 }), [stats]);

    const copyLink = (code: string) => { navigator.clipboard.writeText(`${baseUrl}?ref=${code}`); setCopied(code); setTimeout(() => setCopied(null), 2000); };
    const generateCode = (name: string, type: string) => `${type === "ambassador" ? "AMB" : "COL"}-${name.trim().split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    const handleCreate = async () => {
        if (!newCode.name.trim()) return;
        setCreating(true);
        const code = newCode.codeOverride.trim() || generateCode(newCode.name, newCode.type);
        const { error } = await (supabase as any).from("symposium_referral_codes").insert({ code, name: newCode.name.trim(), type: newCode.type, institution: newCode.institution.trim() });
        if (error) alert(error.message); else { setNewCode({ name: "", type: "ambassador", institution: "", codeOverride: "" }); setShowCreateForm(false); fetchAll(); }
        setCreating(false);
    };

    const toggleActive = async (id: string, cur: boolean) => { await (supabase as any).from("symposium_referral_codes").update({ active: !cur }).eq("id", id); fetchAll(); };
    const saveDiscount = async (id: string) => { await (supabase as any).from("symposium_referral_codes").update({ discount_percent: discountValue, discount_applies_to: discountTargets }).eq("id", id); setEditingDiscount(null); fetchAll(); };

    const exportCSV = () => {
        const rows = stats.filter(s => s.total > 0 || s.visits > 0).map(s => [s.code, `"${s.name}"`, s.type, s.visits, s.total, s.approved, s.pending, s.revenue, s.discount_percent, s.active, `${baseUrl}?ref=${s.code}`]);
        const csv = ["Code,Name,Type,Visits,Registrations,Approved,Pending,Revenue,Discount%,Active,Link", ...rows.map(r => r.join(","))].join("\n");
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `referral_stats_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Affiliate & Referral Tracking</h1>
                    <p className="text-muted-foreground text-sm mt-1">Track visits, registrations, discounts for ambassadors & collaborators</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setShowCreateForm(true)}><Plus className="w-3.5 h-3.5 mr-1.5" /> New Referral</Button>
                    <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV</Button>
                    <Button size="sm" onClick={fetchAll} disabled={loading}>{loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refresh"}</Button>
                </div>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-lg">Create New Referral Code</h3><button onClick={() => setShowCreateForm(false)}><X className="w-4 h-4" /></button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-xs font-bold uppercase">Name *</Label><Input placeholder="e.g. Ahmed Khan" value={newCode.name} onChange={e => setNewCode({ ...newCode, name: e.target.value })} /></div>
                        <div className="space-y-2"><Label className="text-xs font-bold uppercase">Type</Label>
                            <select className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm" value={newCode.type} onChange={e => setNewCode({ ...newCode, type: e.target.value })}>
                                <option value="ambassador">Ambassador</option><option value="collaborator">Collaborator</option>
                            </select>
                        </div>
                        <div className="space-y-2"><Label className="text-xs font-bold uppercase">Institution</Label><Input placeholder="e.g. KMC Peshawar" value={newCode.institution} onChange={e => setNewCode({ ...newCode, institution: e.target.value })} /></div>
                        <div className="space-y-2"><Label className="text-xs font-bold uppercase">Code Override <span className="font-normal text-muted-foreground">(auto if empty)</span></Label><Input placeholder={newCode.name ? generateCode(newCode.name, newCode.type) : "AMB-firstname"} value={newCode.codeOverride} onChange={e => setNewCode({ ...newCode, codeOverride: e.target.value })} /></div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating || !newCode.name.trim()}>{creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />} Create</Button>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { icon: Eye, label: "Total Visits", value: globalTotals.visits, color: "" },
                    { icon: Users, label: "Registrations", value: globalTotals.total, color: "" },
                    { icon: CheckCircle, label: "Approved", value: globalTotals.approved, color: "text-emerald-500" },
                    { icon: TrendingUp, label: "Pending", value: globalTotals.pending, color: "text-amber-500" },
                    { icon: DollarSign, label: "Revenue", value: `${globalTotals.revenue.toLocaleString()} PKR`, color: "text-primary" },
                ].map((c, i) => (
                    <div key={i} className="rounded-xl border border-border p-4 bg-card">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm"><c.icon className="w-4 h-4" /> {c.label}</div>
                        <div className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search by name or code..." className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            {/* Referral List */}
            {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
                <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-2">{filteredStats.length} referral codes</div>
                    {filteredStats.map(stat => (
                        <div key={stat.id} className={`rounded-xl border bg-card overflow-hidden ${!stat.active ? 'opacity-50 border-red-500/30' : 'border-border'}`}>
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedCode(expandedCode === stat.code ? null : stat.code)}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${stat.type === "ambassador" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"}`}>{stat.type === "ambassador" ? "A" : "C"}</div>
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">{stat.name}{!stat.active && <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold">INACTIVE</span>}{stat.discount_percent > 0 && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">{stat.discount_percent}% OFF</span>}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{stat.code}{stat.institution ? ` · ${stat.institution}` : ""}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block"><div className="font-bold text-sm">{stat.visits}</div><div className="text-[10px] text-muted-foreground">visits</div></div>
                                    <div className="text-right"><div className="font-bold">{stat.total}</div><div className="text-[10px] text-muted-foreground">regs</div></div>
                                    <div className="text-right hidden sm:block"><div className="font-bold text-primary">{stat.revenue.toLocaleString()}</div><div className="text-[10px] text-muted-foreground">PKR</div></div>
                                    {expandedCode === stat.code ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                            {expandedCode === stat.code && (
                                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                    <div className="grid grid-cols-4 gap-3 text-sm">
                                        <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-3 text-center"><div className="text-blue-500 font-bold text-lg">{stat.visits}</div><div className="text-xs text-muted-foreground">Visits</div></div>
                                        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3 text-center"><div className="text-emerald-500 font-bold text-lg">{stat.approved}</div><div className="text-xs text-muted-foreground">Approved</div></div>
                                        <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3 text-center"><div className="text-amber-500 font-bold text-lg">{stat.pending}</div><div className="text-xs text-muted-foreground">Pending</div></div>
                                        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center"><div className="text-primary font-bold text-lg">{stat.visits > 0 ? Math.round(stat.total / stat.visits * 100) : 0}%</div><div className="text-xs text-muted-foreground">Conv. Rate</div></div>
                                    </div>
                                    {Object.keys(stat.breakdown).length > 0 && (
                                        <div><div className="text-xs text-muted-foreground mb-2">Breakdown by Event</div><div className="flex flex-wrap gap-2">{Object.entries(stat.breakdown).map(([ev, cnt]) => <span key={ev} className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">{ev}: {cnt}</span>)}</div></div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <input readOnly value={`${baseUrl}?ref=${stat.code}`} className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-xs font-mono border border-border" />
                                        <Button variant="outline" size="sm" onClick={() => copyLink(stat.code)}>{copied === stat.code ? <><CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>}</Button>
                                    </div>
                                    {editingDiscount === stat.code ? (
                                        <div className="rounded-lg border border-border p-4 space-y-3">
                                            <div className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><Percent className="w-3.5 h-3.5" /> Set Discount</div>
                                            <div className="flex items-center gap-3"><Input type="number" min={0} max={100} value={discountValue} onChange={e => setDiscountValue(parseInt(e.target.value) || 0)} className="w-24" /><span className="text-sm text-muted-foreground">% off</span></div>
                                            <div className="text-xs text-muted-foreground mb-1">Applies to:</div>
                                            <div className="flex flex-wrap gap-2">{DISCOUNT_OPTIONS.map(opt => (
                                                <button key={opt} onClick={() => setDiscountTargets(prev => prev.includes(opt) ? prev.filter(t => t !== opt) : [...prev, opt])}
                                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${discountTargets.includes(opt) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'}`}>{opt}</button>
                                            ))}</div>
                                            <div className="flex gap-2 pt-2"><Button size="sm" onClick={() => saveDiscount(stat.id)}>Save</Button><Button size="sm" variant="outline" onClick={() => setEditingDiscount(null)}>Cancel</Button></div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 flex-wrap">
                                            <Button variant="outline" size="sm" onClick={() => { setEditingDiscount(stat.code); setDiscountValue(stat.discount_percent); setDiscountTargets(stat.discount_applies_to || []); }}><Percent className="w-3.5 h-3.5 mr-1" /> {stat.discount_percent > 0 ? `${stat.discount_percent}% Discount` : "Set Discount"}</Button>
                                            <Button variant="outline" size="sm" onClick={() => toggleActive(stat.id, stat.active)} className={!stat.active ? "border-emerald-500/30 text-emerald-500" : "border-red-500/30 text-red-500"}>
                                                {stat.active ? <><Ban className="w-3.5 h-3.5 mr-1" /> Deactivate</> : <><ToggleRight className="w-3.5 h-3.5 mr-1" /> Reactivate</>}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* All Links */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setShowAllLinks(!showAllLinks)}>
                    <div className="flex items-center gap-3"><Link2 className="w-5 h-5 text-primary" /><div><div className="font-semibold">All Affiliate Links</div><div className="text-xs text-muted-foreground">{codes.length} links</div></div></div>
                    {showAllLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {showAllLinks && (
                    <div className="px-4 pb-4 border-t border-border max-h-96 overflow-y-auto"><div className="pt-3 grid gap-1.5">
                        {codes.filter(c => c.active).map(c => (
                            <div key={c.code} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.type === "ambassador" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"}`}>{c.type === "ambassador" ? "AMB" : "COL"}</span>
                                    <span className="text-sm font-medium truncate">{c.name}</span>
                                    <span className="text-xs font-mono text-muted-foreground hidden md:block">{c.code}</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => copyLink(c.code)}>{copied === c.code ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}</Button>
                            </div>
                        ))}
                    </div></div>
                )}
            </div>
        </div>
    );
}
