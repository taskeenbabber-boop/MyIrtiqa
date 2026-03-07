import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, FileText, Download, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Tab = "registrations" | "pitch" | "poster" | "quiz" | "drill" | "debate" | "meme" | "ambassadors" | "speakers";
type Status = "pending" | "approved" | "rejected";

interface Registration {
    id: string;
    ticket_type: string;
    name: string;
    email: string;
    phone: string;
    institution: string | null;
    roll_number: string | null;
    team_members: any;
    selected_workshops: string[];
    total_amount: number;
    receipt_url: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface PitchSubmission {
    id: string;
    name: string;
    email: string;
    phone: string;
    institution: string | null;
    roll_number: string | null;
    pitch_description: string;
    document_url: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface PosterSubmission {
    id: string;
    name: string;
    email: string;
    phone: string;
    institution: string | null;
    roll_number: string | null;
    topic_description: string;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface QuizSubmission {
    id: string;
    name: string;
    email: string;
    phone: string;
    institution: string | null;
    roll_number: string | null;
    receipt_url: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface DrillSubmission {
    id: string;
    name: string;
    email: string;
    phone: string;
    institution: string | null;
    roll_number: string | null;
    receipt_url: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface DebateSubmission {
    id: string;
    name: string;
    email: string;
    phone: string;
    institution: string | null;
    roll_number: string | null;
    receipt_url: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface MemeSubmission {
    id: string;
    name: string;
    email: string;
    phone: string;
    institution: string | null;
    meme_url: string | null;
    description: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface AmbassadorApplication {
    id: string;
    full_name: string;
    email: string;
    whatsapp: string;
    social_url: string | null;
    institution: string;
    year_of_study: string;
    leadership_experience: string;
    promotional_strategy: string;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface Speaker {
    id: string;
    name: string;
    role: string;
    image_url: string;
    event_category: string;
    event_title: string;
    location: string;
    time: string;
    date: string;
    description: string;
    fee: string;
    capacity: string;
    created_at: string;
}

const STATUS_COLORS: Record<Status, { bg: string; text: string; icon: any }> = {
    pending: { bg: "bg-amber-500/10", text: "text-amber-400", icon: Clock },
    approved: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: CheckCircle },
    rejected: { bg: "bg-red-500/10", text: "text-red-400", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status as Status] || STATUS_COLORS.pending;
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            <Icon className="w-3 h-3" /> {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

export default function AdminSymposium() {
    const [tab, setTab] = useState<Tab>("registrations");
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [pitchSubs, setPitchSubs] = useState<PitchSubmission[]>([]);
    const [posterSubs, setPosterSubs] = useState<PosterSubmission[]>([]);
    const [quizSubs, setQuizSubs] = useState<QuizSubmission[]>([]);
    const [drillSubs, setDrillSubs] = useState<DrillSubmission[]>([]);
    const [debateSubs, setDebateSubs] = useState<DebateSubmission[]>([]);
    const [memeSubs, setMemeSubs] = useState<MemeSubmission[]>([]);
    const [ambassadorApps, setAmbassadorApps] = useState<AmbassadorApplication[]>([]);
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);

    // New Speaker Form State
    const [newSpeaker, setNewSpeaker] = useState({
        name: "", role: "", image_url: "", event_category: "Workshop",
        event_title: "", location: "", time: "", date: "", description: "", fee: "", capacity: ""
    });
    const [showSpeakerForm, setShowSpeakerForm] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [regRes, pitchRes, posterRes, quizRes, drillRes, debateRes, memeRes, ambassadorRes, speakersRes] = await Promise.all([
                (supabase as any).from("symposium_registrations").select("*").order("created_at", { ascending: false }),
                (supabase as any).from("symposium_pitch_submissions").select("*").order("created_at", { ascending: false }),
                (supabase as any).from("symposium_poster_submissions").select("*").order("created_at", { ascending: false }),
                (supabase as any).from("symposium_quiz_submissions").select("*").order("created_at", { ascending: false }),
                (supabase as any).from("symposium_drill_submissions").select("*").order("created_at", { ascending: false }),
                (supabase as any).from("symposium_debate_submissions").select("*").order("created_at", { ascending: false }),
                (supabase as any).from("symposium_meme_submissions").select("*").order("created_at", { ascending: false }),
                (supabase as any).from("symposium_ambassador_applications").select("*").order("created_at", { ascending: false }),
                (supabase as any).from("symposium_speakers").select("*").order("created_at", { ascending: false }),
            ]);
            setRegistrations(regRes.data || []);
            setPitchSubs(pitchRes.data || []);
            setPosterSubs(posterRes.data || []);
            setQuizSubs(quizRes.data || []);
            setDrillSubs(drillRes.data || []);
            setDebateSubs(debateRes.data || []);
            setMemeSubs(memeRes.data || []);
            setAmbassadorApps(ambassadorRes.data || []);
            setSpeakers(speakersRes.data || []);
        } catch (err) {
            console.error("Failed to fetch symposium data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const updateStatus = async (table: string, id: string, newStatus: Status, notes?: string) => {
        setUpdating(id);
        try {
            const updatePayload: any = { status: newStatus };
            if (notes !== undefined) updatePayload.admin_notes = notes;

            let regCode: string | undefined = undefined;
            if (table === "symposium_registrations") {
                updatePayload.updated_at = new Date().toISOString();
                if (newStatus === "approved") {
                    regCode = "IRTIQA-" + Math.random().toString(36).substring(2, 6).toUpperCase();
                    updatePayload.registration_code = regCode;
                }
            }

            await (supabase as any).from(table).update(updatePayload).eq("id", id);

            try {
                let item;
                if (table === "symposium_registrations") item = registrations.find(r => r.id === id);
                else if (table === "symposium_pitch_submissions") item = pitchSubs.find(p => p.id === id);
                else if (table === "symposium_poster_submissions") item = posterSubs.find(p => p.id === id);
                else if (table === "symposium_quiz_submissions") item = quizSubs.find(p => p.id === id);
                else if (table === "symposium_drill_submissions") item = drillSubs.find(p => p.id === id);
                else if (table === "symposium_debate_submissions") item = debateSubs.find(p => p.id === id);
                else if (table === "symposium_meme_submissions") item = memeSubs.find(p => p.id === id);
                else if (table === "symposium_ambassador_applications") {
                    const app = ambassadorApps.find(a => a.id === id);
                    if (app) item = { ...app, name: app.full_name } as any;
                }

                if (item && (newStatus === "approved" || newStatus === "rejected")) {
                    await supabase.functions.invoke("send-symposium-email", {
                        body: {
                            to: item.email,
                            name: item.name,
                            status: newStatus,
                            type: table.replace("symposium_", "").replace("_submissions", "").replace("_", " "),
                            notes: notes || "",
                            registrationCode: regCode,
                        },
                    });
                }
            } catch (emailErr) {
                console.warn("Email notification failed (Edge Function may not be deployed yet):", emailErr);
            }

            fetchData();
            setNoteText("");
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setUpdating(null);
        }
    };

    const getDownloadUrl = async (path: string) => {
        const { data } = await supabase.storage.from("symposium-uploads").createSignedUrl(path, 3600, { download: false });
        if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    };

    const handleAddSpeaker = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating("speaker-form");
        try {
            const { error } = await (supabase as any).from("symposium_speakers").insert(newSpeaker);
            if (error) throw error;
            setShowSpeakerForm(false);
            setNewSpeaker({ name: "", role: "", image_url: "", event_category: "Workshop", event_title: "", location: "", time: "", date: "", description: "", fee: "", capacity: "" });
            fetchData();
        } catch (err) {
            console.error("Failed to add speaker:", err);
            alert("Failed to add speaker");
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteSpeaker = async (id: string) => {
        if (!confirm("Are you sure you want to delete this speaker/event?")) return;
        setUpdating(id);
        try {
            const { error } = await (supabase as any).from("symposium_speakers").delete().eq("id", id);
            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error("Failed to delete speaker:", err);
            alert("Failed to delete speaker");
        } finally {
            setUpdating(null);
        }
    };

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: "registrations", label: "Registrations", count: registrations.length },
        { key: "pitch", label: "Pitch Submissions", count: pitchSubs.length },
        { key: "poster", label: "Poster Submissions", count: posterSubs.length },
        { key: "quiz", label: "Quiz Submissions", count: quizSubs.length },
        { key: "drill", label: "Drill Submissions", count: drillSubs.length },
        { key: "debate", label: "Debate Submissions", count: debateSubs.length },
        { key: "meme", label: "Meme Submissions", count: memeSubs.length },
        { key: "ambassadors", label: "Ambassadors", count: ambassadorApps.length },
        { key: "speakers", label: "Speakers & Tutors", count: speakers.length },
    ];

    const pendingCounts = {
        registrations: registrations.filter(r => r.status === "pending").length,
        pitch: pitchSubs.filter(p => p.status === "pending").length,
        poster: posterSubs.filter(p => p.status === "pending").length,
        quiz: quizSubs.filter(p => p.status === "pending").length,
        drill: drillSubs.filter(p => p.status === "pending").length,
        debate: debateSubs.filter(p => p.status === "pending").length,
        meme: memeSubs.filter(p => p.status === "pending").length,
        ambassadors: ambassadorApps.filter(a => a.status === "pending").length,
        speakers: 0
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">AI Symposium Management</h1>
                <p className="text-muted-foreground text-sm mt-1">Review registrations, pitch submissions, and poster applications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tabs.map(t => (
                    <div key={t.key} className="rounded-xl border border-border p-4 bg-card">
                        <div className="text-sm text-muted-foreground">{t.label}</div>
                        <div className="text-3xl font-bold mt-1">{t.count}</div>
                        {pendingCounts[t.key] > 0 && (
                            <div className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {pendingCounts[t.key]} pending review
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        {t.label}
                        {pendingCounts[t.key] > 0 && (
                            <span className="ml-1.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCounts[t.key]}</span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-3">
                    {tab === "registrations" && registrations.map(reg => (
                        <div key={reg.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <div className="font-semibold">{reg.name}</div>
                                        <div className="text-xs text-muted-foreground">{reg.email} • {reg.ticket_type?.replace(/_/g, " ") || "No Ticket Type"}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={reg.status} />
                                    <span className="font-bold text-primary">{(reg.total_amount || 0).toLocaleString()} PKR</span>
                                    {expandedId === reg.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                            {expandedId === reg.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div><span className="text-muted-foreground block text-xs">Phone</span>{reg.phone || "—"}</div>
                                        <div><span className="text-muted-foreground block text-xs">Institution</span>{reg.institution || "—"}</div>
                                        <div><span className="text-muted-foreground block text-xs">Roll Number</span>{reg.roll_number || "—"}</div>
                                        <div><span className="text-muted-foreground block text-xs">Registered</span>{reg.created_at ? new Date(reg.created_at).toLocaleDateString() : "—"}</div>
                                    </div>
                                    {reg.selected_workshops?.length > 0 && (
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Workshops</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {reg.selected_workshops.map(ws => (
                                                    <span key={ws} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">{ws}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {reg.team_members && (
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Team Members</span>
                                            <div className="text-sm">{(reg.team_members as string[]).join(", ")}</div>
                                        </div>
                                    )}
                                    {reg.receipt_url && (
                                        <Button variant="outline" size="sm" onClick={() => getDownloadUrl(reg.receipt_url!)}>
                                            <Download className="w-3.5 h-3.5 mr-1.5" /> View Receipt
                                        </Button>
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><MessageSquare className="w-3 h-3" /> Admin Notes</div>
                                            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" placeholder="Optional notes..." value={expandedId === reg.id ? noteText : ""} onChange={e => setNoteText(e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating === reg.id} onClick={() => updateStatus("symposium_registrations", reg.id, "approved", noteText)}>
                                                {updating === reg.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />} Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" disabled={updating === reg.id} onClick={() => updateStatus("symposium_registrations", reg.id, "rejected", noteText)}>
                                                {updating === reg.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />} Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {tab === "pitch" && pitchSubs.map(pitch => (
                        <div key={pitch.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expandedId === pitch.id ? null : pitch.id)}>
                                <div>
                                    <div className="font-semibold">{pitch.name}</div>
                                    <div className="text-xs text-muted-foreground">{pitch.email} • {pitch.institution || "No institution"}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={pitch.status} />
                                    {expandedId === pitch.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                            {expandedId === pitch.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-muted-foreground block text-xs">Phone</span>{pitch.phone}</div>
                                        <div><span className="text-muted-foreground block text-xs">Roll Number</span>{pitch.roll_number || "—"}</div>
                                        <div><span className="text-muted-foreground block text-xs">Submitted</span>{new Date(pitch.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Pitch Description</span>
                                        <div className="text-sm bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">{pitch.pitch_description}</div>
                                    </div>
                                    {pitch.document_url && (
                                        <Button variant="outline" size="sm" onClick={() => getDownloadUrl(pitch.document_url!)}>
                                            <FileText className="w-3.5 h-3.5 mr-1.5" /> View Pitch Document
                                        </Button>
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><MessageSquare className="w-3 h-3" /> Admin Notes</div>
                                            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" placeholder="Optional notes..." value={expandedId === pitch.id ? noteText : ""} onChange={e => setNoteText(e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating === pitch.id} onClick={() => updateStatus("symposium_pitch_submissions", pitch.id, "approved", noteText)}>
                                                {updating === pitch.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />} Accept
                                            </Button>
                                            <Button size="sm" variant="destructive" disabled={updating === pitch.id} onClick={() => updateStatus("symposium_pitch_submissions", pitch.id, "rejected", noteText)}>
                                                {updating === pitch.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />} Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {tab === "poster" && posterSubs.map(poster => (
                        <div key={poster.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expandedId === poster.id ? null : poster.id)}>
                                <div>
                                    <div className="font-semibold">{poster.name}</div>
                                    <div className="text-xs text-muted-foreground">{poster.email} • {poster.institution || "No institution"}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={poster.status} />
                                    {expandedId === poster.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                            {expandedId === poster.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-muted-foreground block text-xs">Phone</span>{poster.phone}</div>
                                        <div><span className="text-muted-foreground block text-xs">Roll Number</span>{poster.roll_number || "—"}</div>
                                        <div><span className="text-muted-foreground block text-xs">Submitted</span>{new Date(poster.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Poster Topic</span>
                                        <div className="text-sm bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">{poster.topic_description}</div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><MessageSquare className="w-3 h-3" /> Admin Notes</div>
                                            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" placeholder="Optional notes..." value={expandedId === poster.id ? noteText : ""} onChange={e => setNoteText(e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating === poster.id} onClick={() => updateStatus("symposium_poster_submissions", poster.id, "approved", noteText)}>
                                                {updating === poster.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />} Accept
                                            </Button>
                                            <Button size="sm" variant="destructive" disabled={updating === poster.id} onClick={() => updateStatus("symposium_poster_submissions", poster.id, "rejected", noteText)}>
                                                {updating === poster.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />} Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {tab === "quiz" && quizSubs.map(quiz => (
                        <div key={quiz.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expandedId === quiz.id ? null : quiz.id)}>
                                <div>
                                    <div className="font-semibold">{quiz.name}</div>
                                    <div className="text-xs text-muted-foreground">{quiz.email} • {quiz.institution || "No institution"}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={quiz.status} />
                                    {expandedId === quiz.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                            {expandedId === quiz.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-muted-foreground block text-xs">Phone</span>{quiz.phone}</div>
                                        <div><span className="text-muted-foreground block text-xs">Roll Number</span>{quiz.roll_number || "—"}</div>
                                        <div><span className="text-muted-foreground block text-xs">Submitted</span>{new Date(quiz.created_at).toLocaleDateString()}</div>
                                    </div>
                                    {quiz.receipt_url && (
                                        <Button variant="outline" size="sm" onClick={() => getDownloadUrl(quiz.receipt_url!)}>
                                            <Download className="w-3.5 h-3.5 mr-1.5" /> View Payment Receipt
                                        </Button>
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><MessageSquare className="w-3 h-3" /> Admin Notes</div>
                                            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" placeholder="Optional notes..." value={expandedId === quiz.id ? noteText : ""} onChange={e => setNoteText(e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating === quiz.id} onClick={() => updateStatus("symposium_quiz_submissions", quiz.id, "approved", noteText)}>
                                                {updating === quiz.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />} Accept
                                            </Button>
                                            <Button size="sm" variant="destructive" disabled={updating === quiz.id} onClick={() => updateStatus("symposium_quiz_submissions", quiz.id, "rejected", noteText)}>
                                                {updating === quiz.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />} Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {tab === "drill" && drillSubs.map(drill => (
                        <div key={drill.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expandedId === drill.id ? null : drill.id)}>
                                <div>
                                    <div className="font-semibold">{drill.name}</div>
                                    <div className="text-xs text-muted-foreground">{drill.email} • {drill.institution || "No institution"}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={drill.status} />
                                    {expandedId === drill.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                            {expandedId === drill.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-muted-foreground block text-xs">Phone</span>{drill.phone}</div>
                                        <div><span className="text-muted-foreground block text-xs">Roll Number</span>{drill.roll_number || "—"}</div>
                                        <div><span className="text-muted-foreground block text-xs">Submitted</span>{new Date(drill.created_at).toLocaleDateString()}</div>
                                    </div>
                                    {drill.receipt_url && (
                                        <Button variant="outline" size="sm" onClick={() => getDownloadUrl(drill.receipt_url!)}>
                                            <Download className="w-3.5 h-3.5 mr-1.5" /> View Payment Receipt
                                        </Button>
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><MessageSquare className="w-3 h-3" /> Admin Notes</div>
                                            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" placeholder="Optional notes..." value={expandedId === drill.id ? noteText : ""} onChange={e => setNoteText(e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating === drill.id} onClick={() => updateStatus("symposium_drill_submissions", drill.id, "approved", noteText)}>
                                                {updating === drill.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />} Accept
                                            </Button>
                                            <Button size="sm" variant="destructive" disabled={updating === drill.id} onClick={() => updateStatus("symposium_drill_submissions", drill.id, "rejected", noteText)}>
                                                {updating === drill.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />} Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {tab === "debate" && debateSubs.map(debate => (
                        <div key={debate.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expandedId === debate.id ? null : debate.id)}>
                                <div>
                                    <div className="font-semibold">{debate.name}</div>
                                    <div className="text-xs text-muted-foreground">{debate.email} • {debate.institution || "No institution"}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={debate.status} />
                                    {expandedId === debate.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                            {expandedId === debate.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-muted-foreground block text-xs">Phone</span>{debate.phone}</div>
                                        <div><span className="text-muted-foreground block text-xs">Roll Number</span>{debate.roll_number || "—"}</div>
                                        <div><span className="text-muted-foreground block text-xs">Submitted</span>{new Date(debate.created_at).toLocaleDateString()}</div>
                                    </div>
                                    {debate.receipt_url && (
                                        <Button variant="outline" size="sm" onClick={() => getDownloadUrl(debate.receipt_url!)}>
                                            <Download className="w-3.5 h-3.5 mr-1.5" /> View Payment Receipt
                                        </Button>
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><MessageSquare className="w-3 h-3" /> Admin Notes</div>
                                            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" placeholder="Optional notes..." value={expandedId === debate.id ? noteText : ""} onChange={e => setNoteText(e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating === debate.id} onClick={() => updateStatus("symposium_debate_submissions", debate.id, "approved", noteText)}>
                                                {updating === debate.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />} Accept
                                            </Button>
                                            <Button size="sm" variant="destructive" disabled={updating === debate.id} onClick={() => updateStatus("symposium_debate_submissions", debate.id, "rejected", noteText)}>
                                                {updating === debate.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />} Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {tab === "meme" && memeSubs.map(meme => (
                        <div key={meme.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expandedId === meme.id ? null : meme.id)}>
                                <div>
                                    <div className="font-semibold">{meme.name}</div>
                                    <div className="text-xs text-muted-foreground">{meme.email} • {meme.institution || "No institution"}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={meme.status} />
                                    {expandedId === meme.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                            {expandedId === meme.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-muted-foreground block text-xs">Phone</span>{meme.phone}</div>
                                        <div><span className="text-muted-foreground block text-xs">Submitted</span>{new Date(meme.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Meme Description</span>
                                        <div className="text-sm bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">{meme.description || "No description provided"}</div>
                                    </div>
                                    {meme.meme_url && (
                                        <Button variant="outline" size="sm" onClick={() => getDownloadUrl(meme.meme_url!)}>
                                            <Download className="w-3.5 h-3.5 mr-1.5" /> View Meme Upload
                                        </Button>
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><MessageSquare className="w-3 h-3" /> Admin Notes</div>
                                            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" placeholder="Optional notes..." value={expandedId === meme.id ? noteText : ""} onChange={e => setNoteText(e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating === meme.id} onClick={() => updateStatus("symposium_meme_submissions", meme.id, "approved", noteText)}>
                                                {updating === meme.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />} Accept
                                            </Button>
                                            <Button size="sm" variant="destructive" disabled={updating === meme.id} onClick={() => updateStatus("symposium_meme_submissions", meme.id, "rejected", noteText)}>
                                                {updating === meme.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />} Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {tab === "ambassadors" && ambassadorApps.length > 0 && (
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-muted-foreground">{ambassadorApps.length} application(s)</p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    const headers = ["Full Name", "Email", "WhatsApp", "Social URL", "Institution", "Year of Study", "Leadership Experience", "Promotional Strategy", "Status", "Admin Notes", "Applied On"];
                                    const rows = ambassadorApps.map(a => [
                                        a.full_name, a.email, a.whatsapp, a.social_url || "", a.institution, a.year_of_study,
                                        `"${(a.leadership_experience || "").replace(/"/g, '""')}"`,
                                        `"${(a.promotional_strategy || "").replace(/"/g, '""')}"`,
                                        a.status, a.admin_notes || "", new Date(a.created_at).toLocaleDateString()
                                    ]);
                                    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                                    const blob = new Blob([csv], { type: "text/csv" });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = `ambassador_applications_${new Date().toISOString().slice(0, 10)}.csv`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                            </Button>
                        </div>
                    )}

                    {tab === "ambassadors" && ambassadorApps.map(app => (
                        <div key={app.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                                <div>
                                    <div className="font-semibold">{app.full_name}</div>
                                    <div className="text-xs text-muted-foreground">{app.email} • {app.institution} • {app.year_of_study}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={app.status} />
                                    {expandedId === app.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                            {expandedId === app.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div><span className="text-muted-foreground block text-xs">WhatsApp</span>{app.whatsapp}</div>
                                        <div><span className="text-muted-foreground block text-xs">Social</span>{app.social_url ? <a href={app.social_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{app.social_url.substring(0, 30)}...</a> : "—"}</div>
                                        <div><span className="text-muted-foreground block text-xs">Institution</span>{app.institution}</div>
                                        <div><span className="text-muted-foreground block text-xs">Applied</span>{new Date(app.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Leadership / PR Experience</span>
                                        <div className="text-sm bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">{app.leadership_experience}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Promotional Strategy</span>
                                        <div className="text-sm bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">{app.promotional_strategy}</div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><MessageSquare className="w-3 h-3" /> Admin Notes</div>
                                            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" placeholder="Optional notes..." value={expandedId === app.id ? noteText : ""} onChange={e => setNoteText(e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating === app.id} onClick={() => updateStatus("symposium_ambassador_applications", app.id, "approved", noteText)}>
                                                {updating === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />} Accept
                                            </Button>
                                            <Button size="sm" variant="destructive" disabled={updating === app.id} onClick={() => updateStatus("symposium_ambassador_applications", app.id, "rejected", noteText)}>
                                                {updating === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />} Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {tab === "speakers" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">Manage Speakers & Events</h3>
                                <Button onClick={() => setShowSpeakerForm(!showSpeakerForm)}>
                                    {showSpeakerForm ? "Cancel" : "+ Add Speaker/Event"}
                                </Button>
                            </div>

                            {showSpeakerForm && (
                                <form onSubmit={handleAddSpeaker} className="rounded-xl border border-border bg-card p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="text-xs text-muted-foreground">Name</label><input required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.name} onChange={e => setNewSpeaker({ ...newSpeaker, name: e.target.value })} /></div>
                                        <div><label className="text-xs text-muted-foreground">Role</label><input required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.role} onChange={e => setNewSpeaker({ ...newSpeaker, role: e.target.value })} /></div>
                                        <div><label className="text-xs text-muted-foreground">Image URL (unsplash etc)</label><input required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.image_url} onChange={e => setNewSpeaker({ ...newSpeaker, image_url: e.target.value })} /></div>
                                        <div><label className="text-xs text-muted-foreground">Event Category</label>
                                            <select required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.event_category} onChange={e => setNewSpeaker({ ...newSpeaker, event_category: e.target.value })}>
                                                <option value="Workshop">Workshop</option>
                                                <option value="Keynote">Keynote</option>
                                                <option value="Panel">Panel</option>
                                                <option value="Competition">Competition</option>
                                            </select>
                                        </div>
                                        <div><label className="text-xs text-muted-foreground">Event Title</label><input required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.event_title} onChange={e => setNewSpeaker({ ...newSpeaker, event_title: e.target.value })} /></div>
                                        <div><label className="text-xs text-muted-foreground">Location</label><input required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.location} onChange={e => setNewSpeaker({ ...newSpeaker, location: e.target.value })} /></div>
                                        <div><label className="text-xs text-muted-foreground">Time (e.g. 10:00 AM)</label><input required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.time} onChange={e => setNewSpeaker({ ...newSpeaker, time: e.target.value })} /></div>
                                        <div><label className="text-xs text-muted-foreground">Date (e.g. 10 Apr 2026)</label><input required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.date} onChange={e => setNewSpeaker({ ...newSpeaker, date: e.target.value })} /></div>
                                        <div><label className="text-xs text-muted-foreground">Fee</label><input required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.fee} onChange={e => setNewSpeaker({ ...newSpeaker, fee: e.target.value })} /></div>
                                        <div><label className="text-xs text-muted-foreground">Capacity</label><input required className="w-full mt-1 p-2 bg-background border rounded-md" value={newSpeaker.capacity} onChange={e => setNewSpeaker({ ...newSpeaker, capacity: e.target.value })} /></div>
                                        <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Description</label><textarea required rows={3} className="w-full mt-1 p-2 bg-background border rounded-md resize-none" value={newSpeaker.description} onChange={e => setNewSpeaker({ ...newSpeaker, description: e.target.value })} /></div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={updating === "speaker-form"}>
                                            {updating === "speaker-form" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Speaker
                                        </Button>
                                    </div>
                                </form>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {speakers.map(speaker => (
                                    <div key={speaker.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-4">
                                        <img src={speaker.image_url} alt={speaker.name} className="w-16 h-16 rounded-full object-cover bg-muted" />
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold">{speaker.name}</h4>
                                                    <p className="text-xs text-muted-foreground">{speaker.role} • {speaker.event_category}</p>
                                                    <p className="text-sm mt-1">{speaker.event_title}</p>
                                                </div>
                                                <Button size="sm" variant="destructive" onClick={() => handleDeleteSpeaker(speaker.id)} disabled={updating === speaker.id}>
                                                    {updating === speaker.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === "registrations" && registrations.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="font-medium">No registrations yet</p>
                            <p className="text-sm">Registrations will appear here as they come in.</p>
                        </div>
                    )}
                    {tab === "pitch" && pitchSubs.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="font-medium">No pitch submissions yet</p>
                        </div>
                    )}
                    {tab === "poster" && posterSubs.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="font-medium">No poster submissions yet</p>
                        </div>
                    )}
                    {tab === "ambassadors" && ambassadorApps.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="font-medium">No ambassador applications yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
