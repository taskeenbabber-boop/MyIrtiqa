import { useState, useEffect, useMemo } from "react";
import { Link2, Users, DollarSign, TrendingUp, Download, Copy, CheckCircle, ExternalLink, Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/* ═══════════ AFFILIATE CODES ═══════════ */
const AMBASSADOR_CODES: { code: string; name: string; institution: string }[] = [
    { code: "AMB-shahsawar", name: "Syed Shahsawar Ahmad Bacha", institution: "Bacha Khan Medical College" },
    { code: "AMB-habibullah", name: "Habib Ullah", institution: "Saidu Medical College Swat" },
    { code: "AMB-tashfeen", name: "Syed Tashfeen Mustafa Shah", institution: "UCMD UOL Lahore" },
    { code: "AMB-ahtida", name: "Ahtida Fatima", institution: "Sheikh Zayed Medical College RYK" },
    { code: "AMB-romesa", name: "Syeda Romesa Sana", institution: "NWSM" },
    { code: "AMB-shumayel", name: "Shumayel Ashraf", institution: "NWSM" },
    { code: "AMB-abbas", name: "Muhammad Abbas Jadoon", institution: "PICO" },
    { code: "AMB-zakreya", name: "Muhammad Zakreya", institution: "Swat Medical College" },
    { code: "AMB-hira", name: "Hira Rahim", institution: "KGMC" },
    { code: "AMB-eman", name: "Eman Afzal", institution: "Islam Medical College Sialkot" },
    { code: "AMB-kashf", name: "Kashf Younas", institution: "Bakhtawar Amin Medical College" },
    { code: "AMB-abrar", name: "Muhammad Abrar", institution: "Northwest College of Nursing" },
    { code: "AMB-inzimam", name: "Inzimam Ul Haq", institution: "Guilin Medical University China" },
    { code: "AMB-sadeeq", name: "Sadeeq Rahman", institution: "Nowshera Medical College" },
    { code: "AMB-danyal", name: "Danyal Khan", institution: "Gomal Medical College" },
    { code: "AMB-hamza", name: "Muhammad Hamza", institution: "Gomal Medical College DI Khan" },
    { code: "AMB-abdullah", name: "Muhammad Abdullah", institution: "Allama Iqbal Medical College Lahore" },
    { code: "AMB-umaima", name: "Umaima Yasir", institution: "Rawalpindi Medical University" },
    { code: "AMB-ijaz", name: "Ijaz Dawar", institution: "Pak International Medical College" },
    { code: "AMB-habib", name: "Habib Ur Rehman", institution: "Khyber Medical College" },
    { code: "AMB-alishba", name: "Alishba Sultan", institution: "Rehman Medical College" },
    { code: "AMB-fahad", name: "Fahad", institution: "Khyber Medical College Peshawar" },
    { code: "AMB-eamil", name: "Eamil Sarosh Malik", institution: "SZABMU" },
    { code: "AMB-zuhaib", name: "Zuhaib Hassan", institution: "PIMC Peshawar" },
    { code: "AMB-sana", name: "Sana Bint e Nazir", institution: "Khyber Medical College Peshawar" },
    { code: "AMB-ahmed", name: "Ahmed Nawaz", institution: "FAST NUCES Peshawar" },
    { code: "AMB-khoula", name: "Khoula Shifa", institution: "Ameer Ud Din Medical College Lahore" },
    { code: "AMB-abuzar", name: "Abuzar Farhad", institution: "Northwest General Hospital" },
    { code: "AMB-athar", name: "Muhammad Athar Rauf", institution: "Allama Iqbal Medical College" },
    { code: "AMB-ifrah", name: "Ifrah Nadeem", institution: "Quaid e Azam Medical College" },
    { code: "AMB-sadia", name: "Sadia Shafi", institution: "LIHS Sahiwal" },
    { code: "AMB-haris", name: "Muhammad Haris", institution: "GCON KTH" },
    { code: "AMB-laiba", name: "Laiba Akhlaq", institution: "Khyber Girls Medical College" },
    { code: "AMB-shahan", name: "Muhammad Shahan", institution: "Kabir Medical College" },
    { code: "AMB-haseeb", name: "Abdul Haseeb", institution: "Loralai Medical College" },
    { code: "AMB-adeel", name: "Syed Adeel Ahmad", institution: "Nowshera Medical College" },
    { code: "AMB-azam", name: "Mian Ahmed Azam", institution: "Jinnah Medical College" },
    { code: "AMB-talha", name: "Talha Rafiq", institution: "Bacha Khan Medical College Mardan" },
    { code: "AMB-maryam", name: "Maryam Ajmal", institution: "Bahria University College of Medicine" },
    { code: "AMB-ahmadali", name: "Ahmad Ali", institution: "Peshawar Medical College" },
    { code: "AMB-aneika", name: "Aneika", institution: "Gomal Medical College" },
    { code: "AMB-haseebfareed", name: "Muhammad Haseeb Fareed", institution: "NUST School of Health Sciences" },
    { code: "AMB-hamzaarfi", name: "Syed Hamza Hussain Arfi", institution: "IM Sciences Peshawar" },
    { code: "AMB-hamad", name: "Muhammad Hamad Khan", institution: "Bacha Khan Medical College Mardan" },
    { code: "AMB-saifullah", name: "Saif Ullah", institution: "Nowshera Medical College" },
    { code: "AMB-armaghan", name: "Ahmad Armaghan", institution: "Bannu Medical College" },
    { code: "AMB-areeba", name: "Areeba Tariq", institution: "Khyber Girls Medical College Peshawar" },
    { code: "AMB-faria", name: "Faria Ali", institution: "MBBSMC AJK" },
    { code: "AMB-shafqat", name: "Shafqat Shahzad Khanzada", institution: "University of the Punjab Lahore" },
    { code: "AMB-zarak", name: "Zarak Khan", institution: "KMU" },
    { code: "AMB-moiz", name: "Abdul Moiz", institution: "LUMHS Jamshoro" },
    { code: "AMB-iqra", name: "Iqra Karim", institution: "Bannu Medical College" },
    { code: "AMB-ayesha", name: "Ayesha Hussain", institution: "Women Medical College Abbottabad" },
    { code: "AMB-zohaib", name: "Mian Zohaib Ahmad", institution: "NWSM" },
    { code: "AMB-uzma", name: "Uzma Jamal", institution: "SMBBMC Lyari Karachi" },
    { code: "AMB-hadeesa", name: "Hadeesa Afridi", institution: "PIMC Peshawar" },
    { code: "AMB-mohsin", name: "Muhammad Mohsin", institution: "Swat Medical College" },
];

const COLLABORATOR_CODES: { code: string; name: string }[] = [
    { code: "COL-tmm", name: "The Medical Mentors (TMM)" },
    { code: "COL-irc", name: "IRC" },
    { code: "COL-ifmsa", name: "IFMSA" },
];

const ALL_CODES = [
    ...AMBASSADOR_CODES.map(a => ({ ...a, type: "Ambassador" as const })),
    ...COLLABORATOR_CODES.map(c => ({ ...c, institution: "", type: "Collaborator" as const })),
];

/* ═══════════ DB TABLES ═══════════ */
const TABLES = [
    { key: "registrations", table: "symposium_registrations", label: "Registrations", amountField: "total_amount" },
    { key: "pitch", table: "symposium_pitch_submissions", label: "Pitch" },
    { key: "poster", table: "symposium_poster_submissions", label: "Poster" },
    { key: "quiz", table: "symposium_quiz_submissions", label: "Quiz" },
    { key: "drill", table: "symposium_drill_submissions", label: "Drill" },
    { key: "debate", table: "symposium_debate_submissions", label: "Debate" },
    { key: "meme", table: "symposium_meme_submissions", label: "Meme" },
] as const;

interface ReferralRow {
    referral_code: string | null;
    status: string;
    total_amount?: number;
    name?: string;
    email?: string;
    created_at?: string;
}

interface ReferralStat {
    code: string;
    name: string;
    type: string;
    institution: string;
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    revenue: number;
    breakdown: Record<string, number>;
}

export default function AdminReferrals() {
    const [loading, setLoading] = useState(true);
    const [allData, setAllData] = useState<Record<string, ReferralRow[]>>({});
    const [copied, setCopied] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCode, setExpandedCode] = useState<string | null>(null);
    const [showAllLinks, setShowAllLinks] = useState(false);

    const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/ai-symposium` : "https://irtiqa.org/ai-symposium";

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const results: Record<string, ReferralRow[]> = {};
            await Promise.all(
                TABLES.map(async (t) => {
                    const { data } = await (supabase as any)
                        .from(t.table)
                        .select("referral_code, status, total_amount, name, email, created_at")
                        .not("referral_code", "is", null);
                    results[t.key] = (data || []).filter((r: ReferralRow) => r.referral_code && r.referral_code.trim() !== "");
                })
            );
            setAllData(results);
        } catch (err) {
            console.error("Failed to fetch referral data:", err);
        } finally {
            setLoading(false);
        }
    };

    const stats: ReferralStat[] = useMemo(() => {
        const codeMap = new Map<string, ReferralStat>();

        // Init from known codes
        ALL_CODES.forEach(c => {
            codeMap.set(c.code, {
                code: c.code,
                name: c.name,
                type: c.type,
                institution: c.institution,
                total: 0, approved: 0, pending: 0, rejected: 0, revenue: 0,
                breakdown: {},
            });
        });

        // Aggregate data
        TABLES.forEach(t => {
            const rows = allData[t.key] || [];
            rows.forEach(row => {
                const code = row.referral_code!;
                if (!codeMap.has(code)) {
                    codeMap.set(code, {
                        code, name: code, type: "Unknown", institution: "",
                        total: 0, approved: 0, pending: 0, rejected: 0, revenue: 0,
                        breakdown: {},
                    });
                }
                const stat = codeMap.get(code)!;
                stat.total++;
                if (row.status === "approved") { stat.approved++; stat.revenue += row.total_amount || 0; }
                else if (row.status === "rejected") stat.rejected++;
                else stat.pending++;
                stat.breakdown[t.label] = (stat.breakdown[t.label] || 0) + 1;
            });
        });

        return Array.from(codeMap.values())
            .sort((a, b) => b.total - a.total);
    }, [allData]);

    const filteredStats = useMemo(() => {
        if (!searchQuery.trim()) return stats.filter(s => s.total > 0);
        const q = searchQuery.toLowerCase();
        return stats.filter(s =>
            s.code.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.type.toLowerCase().includes(q)
        );
    }, [stats, searchQuery]);

    const globalTotals = useMemo(() => {
        return stats.reduce((acc, s) => ({
            total: acc.total + s.total,
            approved: acc.approved + s.approved,
            pending: acc.pending + s.pending,
            revenue: acc.revenue + s.revenue,
        }), { total: 0, approved: 0, pending: 0, revenue: 0 });
    }, [stats]);

    const copyLink = (code: string) => {
        navigator.clipboard.writeText(`${baseUrl}?ref=${code}`);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    const exportCSV = () => {
        const headers = ["Code", "Name", "Type", "Total Registrations", "Approved", "Pending", "Rejected", "Revenue (PKR)", "Link"];
        const rows = stats.filter(s => s.total > 0).map(s => [
            s.code, s.name, s.type, s.total, s.approved, s.pending, s.rejected, s.revenue,
            `${baseUrl}?ref=${s.code}`
        ]);
        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `referral_stats_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportAllLinks = () => {
        const headers = ["Code", "Name", "Type", "Full Link"];
        const rows = ALL_CODES.map(c => [
            c.code, c.name, c.type, `${baseUrl}?ref=${c.code}`
        ]);
        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `all_affiliate_links_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Affiliate & Referral Tracking</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Track registrations from ambassadors and collaborators across all events
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportAllLinks}>
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Export All Links
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportCSV}>
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Export Stats CSV
                    </Button>
                    <Button size="sm" onClick={fetchAllData} disabled={loading}>
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refresh"}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border p-4 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Users className="w-4 h-4" /> Total Referrals
                    </div>
                    <div className="text-3xl font-bold mt-1">{globalTotals.total}</div>
                </div>
                <div className="rounded-xl border border-border p-4 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <CheckCircle className="w-4 h-4" /> Approved
                    </div>
                    <div className="text-3xl font-bold mt-1 text-emerald-500">{globalTotals.approved}</div>
                </div>
                <div className="rounded-xl border border-border p-4 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <TrendingUp className="w-4 h-4" /> Pending
                    </div>
                    <div className="text-3xl font-bold mt-1 text-amber-500">{globalTotals.pending}</div>
                </div>
                <div className="rounded-xl border border-border p-4 bg-card">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <DollarSign className="w-4 h-4" /> Revenue
                    </div>
                    <div className="text-3xl font-bold mt-1 text-primary">{globalTotals.revenue.toLocaleString()} PKR</div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by name, code, or type..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Referral Stats Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-2">
                        {filteredStats.length} referral source{filteredStats.length !== 1 ? "s" : ""} with activity
                    </div>

                    {filteredStats.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-8 text-center">
                            <Link2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">
                                {searchQuery ? "No referral sources match your search" : "No referral data yet. Share the affiliate links to start tracking!"}
                            </p>
                        </div>
                    ) : (
                        filteredStats.map(stat => (
                            <div key={stat.code} className="rounded-xl border border-border bg-card overflow-hidden">
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => setExpandedCode(expandedCode === stat.code ? null : stat.code)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                            stat.type === "Ambassador" ? "bg-blue-500/10 text-blue-500" : 
                                            stat.type === "Collaborator" ? "bg-purple-500/10 text-purple-500" : 
                                            "bg-gray-500/10 text-gray-500"
                                        }`}>
                                            {stat.type === "Ambassador" ? "A" : stat.type === "Collaborator" ? "C" : "?"}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{stat.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{stat.code}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-bold">{stat.total}</div>
                                            <div className="text-xs text-muted-foreground">registrations</div>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <div className="font-bold text-emerald-500">{stat.approved}</div>
                                            <div className="text-xs text-muted-foreground">approved</div>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <div className="font-bold text-primary">{stat.revenue.toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">PKR</div>
                                        </div>
                                        {expandedCode === stat.code ?
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" /> :
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        }
                                    </div>
                                </div>

                                {expandedCode === stat.code && (
                                    <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                        {/* Status breakdown */}
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3 text-center">
                                                <div className="text-emerald-500 font-bold text-lg">{stat.approved}</div>
                                                <div className="text-xs text-muted-foreground">Approved</div>
                                            </div>
                                            <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3 text-center">
                                                <div className="text-amber-500 font-bold text-lg">{stat.pending}</div>
                                                <div className="text-xs text-muted-foreground">Pending</div>
                                            </div>
                                            <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3 text-center">
                                                <div className="text-red-500 font-bold text-lg">{stat.rejected}</div>
                                                <div className="text-xs text-muted-foreground">Rejected</div>
                                            </div>
                                        </div>

                                        {/* Event breakdown */}
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-2">Breakdown by Event</div>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(stat.breakdown).map(([event, count]) => (
                                                    <span key={event} className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                                                        {event}: {count}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Affiliate link */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                readOnly
                                                value={`${baseUrl}?ref=${stat.code}`}
                                                className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-xs font-mono border border-border"
                                            />
                                            <Button variant="outline" size="sm" onClick={() => copyLink(stat.code)}>
                                                {copied === stat.code ? (
                                                    <><CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied</>
                                                ) : (
                                                    <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* All Links Section */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setShowAllLinks(!showAllLinks)}
                >
                    <div className="flex items-center gap-3">
                        <Link2 className="w-5 h-5 text-primary" />
                        <div>
                            <div className="font-semibold">All Affiliate Links</div>
                            <div className="text-xs text-muted-foreground">{ALL_CODES.length} links — Click to view/copy all</div>
                        </div>
                    </div>
                    {showAllLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {showAllLinks && (
                    <div className="px-4 pb-4 border-t border-border space-y-2 max-h-96 overflow-y-auto">
                        <div className="pt-3 grid gap-1.5">
                            {ALL_CODES.map(c => (
                                <div key={c.code} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                            c.type === "Ambassador" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                                        }`}>{c.type === "Ambassador" ? "AMB" : "COL"}</span>
                                        <span className="text-sm font-medium truncate">{c.name}</span>
                                        <span className="text-xs font-mono text-muted-foreground hidden md:block truncate">{c.code}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => copyLink(c.code)}>
                                        {copied === c.code ? (
                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
