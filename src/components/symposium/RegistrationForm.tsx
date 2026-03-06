import { useState } from "react";
import { X, CheckCircle, Upload, CreditCard, Users, User, ArrowRight, ShieldCheck, ArrowUpRight, Sparkles, Loader2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#3b82f6";
const ACCENT_BG = "rgba(59,130,246,0.08)";
const SURFACE = "#111111";
const BORDER = "#222222";

/* ═══════════ CATEGORY ═══════════ */
type Category = "NWSM_STUDENT" | "OUTSIDER_STUDENT" | "FACULTY" | "OUTSIDER_TEAM_3" | "OUTSIDER_TEAM_4";

const CATEGORY_INFO: Record<Category, { label: string; desc: string; icon: typeof User }> = {
    NWSM_STUDENT: { label: "NWSM Student", desc: "Northwest School of Medicine student", icon: User },
    OUTSIDER_STUDENT: { label: "Outsider Student", desc: "Student from another institution", icon: User },
    FACULTY: { label: "Faculty / Doctor / Consultant", desc: "Medical professional or faculty", icon: ShieldCheck },
    OUTSIDER_TEAM_3: { label: "Team of 3 (Outsiders)", desc: "3 outsider students — conference day only", icon: Users },
    OUTSIDER_TEAM_4: { label: "Team of 4 (Outsiders)", desc: "4 outsider students — conference day only", icon: Users },
};

/* ═══════════ WORKSHOPS ═══════════ */
interface Workshop {
    id: string;
    title: string;
    slot: string;
    time: string;
    speaker: string;
}

const WORKSHOPS: Workshop[] = [
    { id: "ws-1", title: "AI for Note Taking", slot: "morning", time: "10 AM – 12 PM", speaker: "Haroon" },
    { id: "ws-2", title: "Prompt Engineering & AI in Design", slot: "morning", time: "10 AM – 12 PM", speaker: "Mr. Asad" },
    { id: "ws-3", title: "AI in Research", slot: "afternoon", time: "2 PM – 4 PM", speaker: "Iftikhar" },
    { id: "ws-4", title: "Clinical Audit & AI in Clinical Use", slot: "afternoon", time: "2 PM – 4 PM", speaker: "Dr. Almas" },
];

/* ═══════════ FEE CONSTANTS ═══════════ */
const WORKSHOP_FEE_STUDENT = 500;
const WORKSHOP_FEE_FACULTY = 1000;

const CONFERENCE_FEE: Record<Category, number> = {
    NWSM_STUDENT: 500,
    OUTSIDER_STUDENT: 1000,
    FACULTY: 1500,
    OUTSIDER_TEAM_3: 3000,
    OUTSIDER_TEAM_4: 4000,
};

/* ═══════════ COMPONENT ═══════════ */
interface RegistrationFormProps {
    onClose: () => void;
}

export function RegistrationForm({ onClose }: RegistrationFormProps) {
    // Step order: 1=Events, 2=Category, 3=Details, 4=Payment
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState<Category | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [wantWorkshops, setWantWorkshops] = useState(false);
    const [wantConference, setWantConference] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        institution: "",
        rollNumber: "",
        teamMembers: ["", "", ""],
        selectedWorkshops: [] as string[],
        receiptFile: null as File | null,
        registrationCode: "",
    });

    const isTeam = category === "OUTSIDER_TEAM_3" || category === "OUTSIDER_TEAM_4";
    const isFaculty = category === "FACULTY";
    const workshopFee = isFaculty ? WORKSHOP_FEE_FACULTY : WORKSHOP_FEE_STUDENT;

    /* ——— pricing ——— */
    const calculateTotal = () => {
        if (!category) return 0;
        let total = 0;
        if (wantConference) total += CONFERENCE_FEE[category];
        if (wantWorkshops && !isTeam) {
            total += formData.selectedWorkshops.length * workshopFee;
            // Faculty gets a 1000 PKR discount if they pick both workshops + conference (Full Event Pass = 2500)
            if (wantConference && formData.selectedWorkshops.length === 2 && category === "FACULTY") {
                total -= 1000;
            }
        }
        return total;
    };

    /* ——— workshop toggle (mutually exclusive per slot) ——— */
    const toggleWorkshop = (id: string, slot: string) => {
        setFormData(prev => {
            const isSelected = prev.selectedWorkshops.includes(id);
            if (isSelected) {
                return { ...prev, selectedWorkshops: prev.selectedWorkshops.filter(w => w !== id) };
            } else {
                const otherInSlot = WORKSHOPS.filter(w => w.slot === slot && w.id !== id).map(w => w.id);
                const filtered = prev.selectedWorkshops.filter(w => !otherInSlot.includes(w));
                return { ...prev, selectedWorkshops: [...filtered, id] };
            }
        });
    };

    const totalSteps = 4;
    const handleNext = () => setStep(s => Math.min(totalSteps, s + 1));
    const handleBack = () => setStep(s => Math.max(1, s - 1));

    const stepLabels = ["Events", "Category", "Details", "Payment"];

    const canContinue = () => {
        if (step === 1) return wantConference || wantWorkshops; // must pick at least one
        if (step === 2) return !!category;
        if (step === 3) {
            const baseValid = formData.name.trim() !== "" && formData.email.trim() !== "" && formData.phone.trim() !== "";
            if (category === "NWSM_STUDENT") return baseValid && formData.rollNumber.trim() !== "";
            if (isTeam) {
                const teamCount = category === "OUTSIDER_TEAM_3" ? 2 : 3;
                const allTeamFilled = formData.teamMembers.slice(0, teamCount).every(m => m.trim() !== "");
                return baseValid && allTeamFilled;
            }
            return baseValid;
        }
        // Payment step — receipt is MANDATORY
        if (step === totalSteps) return !!formData.receiptFile;
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let receiptUrl: string | null = null;
            if (formData.receiptFile) {
                const ext = formData.receiptFile.name.split(".").pop();
                const path = `receipts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("symposium-uploads")
                    .upload(path, formData.receiptFile);
                if (!uploadError) receiptUrl = path;
            }

            const totalAmount = calculateTotal();
            const confFee = wantConference && category ? CONFERENCE_FEE[category] : 0;

            // Generate unique registration code
            const regCode = "IRTIQA-" + Math.random().toString(36).substring(2, 6).toUpperCase();

            const { error } = await (supabase as any).from("symposium_registrations").insert({
                ticket_type: category,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                institution: formData.institution || null,
                roll_number: formData.rollNumber || null,
                team_members: isTeam ? formData.teamMembers.filter(m => m.trim()) : null,
                selected_workshops: wantWorkshops && !isTeam ? formData.selectedWorkshops : [],
                total_amount: totalAmount,
                receipt_url: receiptUrl,
                status: "pending",
                is_nwsm_student: category === "NWSM_STUDENT",
                wants_workshops: wantWorkshops && !isTeam,
                wants_conference: wantConference,
                workshop_fee_per: workshopFee,
                conference_fee: confFee,
                registration_code: regCode,
            });

            if (error) throw error;
            setSubmitted(true);
            setFormData(prev => ({ ...prev, registrationCode: regCode }));

            // Send confirmation email (fire-and-forget)
            supabase.functions.invoke("send-symposium-email", {
                body: {
                    mode: "confirmation",
                    to: formData.email,
                    name: formData.name,
                    type: "registration",
                    registrationCode: regCode,
                },
            }).catch(console.error);
        } catch (err: any) {
            console.error("Registration error:", err);
            alert("Registration submitted! We'll process your application shortly.");
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    /* ——— Workshop selection card ——— */
    const WorkshopCard = ({ ws }: { ws: Workshop }) => {
        const selected = formData.selectedWorkshops.includes(ws.id);
        return (
            <div
                onClick={() => toggleWorkshop(ws.id, ws.slot)}
                className="p-4 rounded-xl cursor-pointer transition-all duration-300"
                style={{
                    background: selected ? ACCENT_BG : SURFACE,
                    border: `1px solid ${selected ? ACCENT : BORDER}`,
                }}
            >
                <div className="flex justify-between items-start gap-3">
                    <div>
                        <span className={`font-semibold text-sm block ${selected ? "text-white" : "text-white/50"}`}>{ws.title}</span>
                        <span className="text-xs text-white/25 mt-0.5 block">{ws.speaker}</span>
                        <span className="text-xs text-white/20 mt-0.5 block">{ws.time}</span>
                    </div>
                    <div
                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                            background: selected ? ACCENT : "transparent",
                            border: `1px solid ${selected ? ACCENT : "#444"}`,
                        }}
                    >
                        {selected && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                    </div>
                </div>
            </div>
        );
    };

    /* ═══════════ SUCCESS SCREEN ═══════════ */
    if (submitted) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md rounded-3xl p-10 text-center relative z-10"
                    style={{ background: "#0e0e0e", border: `1px solid ${BORDER}` }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(34,197,94,0.1)" }}>
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-3">Registration Received!</h2>
                    {formData.registrationCode && (
                        <div className="mb-5 p-4 rounded-xl" style={{ background: '#0a0a0a', border: '2px dashed rgba(59,130,246,0.3)' }}>
                            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">Your Registration Code</p>
                            <p className="text-2xl font-black tracking-[4px] font-mono" style={{ color: ACCENT }}>{formData.registrationCode}</p>
                            <p className="text-[10px] text-white/20 mt-2">Present this code at the registration desk</p>
                        </div>
                    )}
                    <p className="text-white/40 text-sm leading-relaxed mb-6">
                        Thank you for registering. Our team will verify your payment and send a confirmation email to <strong className="text-white/60">{formData.email}</strong> within 24–48 hours.
                    </p>
                    <button
                        onClick={onClose}
                        className="text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-full transition-all hover:scale-105"
                        style={{ background: ACCENT, color: "#000" }}
                    >
                        Done
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-3xl relative"
                style={{ background: "#0e0e0e", border: `1px solid ${BORDER}` }}
            >
                {/* ═══ Header ═══ */}
                <div className="p-6 flex justify-between items-center" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Registration</h2>
                        <div className="flex items-center gap-2 mt-2">
                            {stepLabels.map((title, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div
                                        className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center"
                                        style={{
                                            background: step > i + 1 ? ACCENT : step === i + 1 ? ACCENT_BG : "transparent",
                                            color: step > i + 1 ? "#000" : step === i + 1 ? ACCENT : "#444",
                                            border: step <= i + 1 ? `1px solid ${step === i + 1 ? ACCENT : "#333"}` : "none",
                                        }}
                                    >
                                        {step > i + 1 ? "✓" : i + 1}
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? "text-white" : "text-white/20"}`}>
                                        {title}
                                    </span>
                                    {i < stepLabels.length - 1 && <div className="w-3 h-px hidden sm:block" style={{ background: "#333" }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ═══ Progress Bar ═══ */}
                <div className="w-full h-0.5" style={{ background: BORDER }}>
                    <motion.div className="h-full" style={{ background: ACCENT }} initial={{ width: "25%" }} animate={{ width: `${(step / totalSteps) * 100}%` }} />
                </div>

                {/* ═══ Form Content ═══ */}
                <div className="p-6 md:p-8 overflow-y-auto flex-grow scrollbar-hide">
                    <AnimatePresence mode="wait">

                        {/* ────── STEP 1: What do you want to attend? ────── */}
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">What would you like to attend?</h3>
                                    <p className="text-sm text-white/30">Select the events you want to register for</p>
                                </div>

                                {/* Day 2: Conference */}
                                <div
                                    onClick={() => {
                                        const newVal = !wantConference;
                                        setWantConference(newVal);
                                        if (!newVal && (category === "OUTSIDER_TEAM_3" || category === "OUTSIDER_TEAM_4")) {
                                            setCategory(null);
                                        }
                                    }}
                                    className="p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden"
                                    style={{
                                        background: wantConference
                                            ? "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)"
                                            : SURFACE,
                                        border: `${wantConference ? "2px" : "1px"} solid ${wantConference ? ACCENT : BORDER}`,
                                    }}
                                >
                                    {wantConference && (
                                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none" style={{ background: ACCENT, opacity: 0.1 }} />
                                    )}
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: wantConference ? ACCENT : ACCENT_BG }}>
                                                <Calendar className="w-5 h-5" style={{ color: wantConference ? "#000" : ACCENT }} />
                                            </div>
                                            <div>
                                                <span className="font-bold text-white text-base block">Day 2: Main Conference</span>
                                                <span className="text-xs text-white/40 block mt-0.5">April 11 — Keynotes, Panel Discussion, AI Poster, AI Drill, AI Debate, AI Quiz, AI Pitch, Memes</span>
                                            </div>
                                        </div>
                                        {wantConference && <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: ACCENT }} />}
                                    </div>
                                </div>

                                {/* Day 1: Workshops */}
                                <div
                                    onClick={() => setWantWorkshops(!wantWorkshops)}
                                    className="p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden"
                                    style={{
                                        background: wantWorkshops
                                            ? "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)"
                                            : SURFACE,
                                        border: `${wantWorkshops ? "2px" : "1px"} solid ${wantWorkshops ? ACCENT : BORDER}`,
                                    }}
                                >
                                    {wantWorkshops && (
                                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none" style={{ background: ACCENT, opacity: 0.1 }} />
                                    )}
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: wantWorkshops ? ACCENT : ACCENT_BG }}>
                                                <Sparkles className="w-5 h-5" style={{ color: wantWorkshops ? "#000" : ACCENT }} />
                                            </div>
                                            <div>
                                                <span className="font-bold text-white text-base block">Day 1: Pre-Conference Workshops</span>
                                                <span className="text-xs text-white/40 block mt-0.5">April 10 — Select from 4 hands-on AI workshops (max 1 morning + 1 afternoon)</span>
                                            </div>
                                        </div>
                                        {wantWorkshops && <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: ACCENT }} />}
                                    </div>
                                </div>

                                {/* Workshop selection (shown inline if workshops enabled) */}
                                {wantWorkshops && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 overflow-hidden">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                                                Morning Session — Select 1
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {WORKSHOPS.filter(ws => ws.slot === "morning").map(ws => (
                                                    <WorkshopCard key={ws.id} ws={ws} />
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                                                Afternoon Session — Select 1
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {WORKSHOPS.filter(ws => ws.slot === "afternoon").map(ws => (
                                                    <WorkshopCard key={ws.id} ws={ws} />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* ────── STEP 2: Category Selection ────── */}
                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">Select Your Category</h3>
                                    <p className="text-sm text-white/30">Choose the category that best describes you</p>
                                </div>

                                {/* Individual Categories */}
                                <div>
                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Individual Registration</div>
                                    <div className="space-y-2">
                                        {(["NWSM_STUDENT", "OUTSIDER_STUDENT", "FACULTY"] as Category[]).map(cat => {
                                            const info = CATEGORY_INFO[cat];
                                            const Icon = info.icon;
                                            const isSelected = category === cat;
                                            return (
                                                <div
                                                    key={cat}
                                                    onClick={() => setCategory(cat)}
                                                    className="p-4 rounded-xl cursor-pointer transition-all duration-300"
                                                    style={{
                                                        background: isSelected ? ACCENT_BG : SURFACE,
                                                        border: `1px solid ${isSelected ? ACCENT : BORDER}`,
                                                    }}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isSelected ? ACCENT : "#444" }} />
                                                            <div>
                                                                <span className={`font-semibold text-sm block ${isSelected ? "text-white" : "text-white/50"}`}>{info.label}</span>
                                                                <span className="text-[10px] text-white/20">{info.desc}</span>
                                                            </div>
                                                        </div>
                                                        {isSelected && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Divider */}
                                {wantConference && (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-grow h-px" style={{ background: BORDER }} />
                                            <span className="text-[10px] font-bold text-white/15 uppercase tracking-widest">Team Discounts (Outsiders Only)</span>
                                            <div className="flex-grow h-px" style={{ background: BORDER }} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {(["OUTSIDER_TEAM_3", "OUTSIDER_TEAM_4"] as Category[]).map(cat => {
                                                const info = CATEGORY_INFO[cat];
                                                const isSelected = category === cat;
                                                return (
                                                    <div
                                                        key={cat}
                                                        onClick={() => { setCategory(cat); setWantWorkshops(false); }}
                                                        className="p-4 rounded-xl cursor-pointer transition-all duration-300"
                                                        style={{
                                                            background: isSelected ? ACCENT_BG : SURFACE,
                                                            border: `1px solid ${isSelected ? ACCENT : BORDER}`,
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-3">
                                                                <Users className="w-4 h-4 flex-shrink-0" style={{ color: isSelected ? ACCENT : "#444" }} />
                                                                <div>
                                                                    <span className={`font-semibold text-sm block ${isSelected ? "text-white" : "text-white/50"}`}>{info.label}</span>
                                                                    <span className="text-[10px] text-white/20">{info.desc}</span>
                                                                </div>
                                                            </div>
                                                            {isSelected && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {/* Fee breakdown — shown AFTER category is selected */}
                                {category && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-2xl p-5 relative overflow-hidden"
                                        style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.04) 100%)", border: `1px solid rgba(59,130,246,0.2)` }}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] pointer-events-none" style={{ background: ACCENT, opacity: 0.08 }} />
                                        <div className="relative z-10">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Your Fee Breakdown</div>
                                            <div className="space-y-2 text-sm">
                                                {wantConference && (
                                                    <div className="flex justify-between text-white/50">
                                                        <span>Conference Day Pass</span>
                                                        <span className="font-bold" style={{ color: ACCENT }}>{CONFERENCE_FEE[category].toLocaleString()} PKR</span>
                                                    </div>
                                                )}
                                                {wantWorkshops && !isTeam && formData.selectedWorkshops.length > 0 && (
                                                    <div className="flex justify-between text-white/50">
                                                        <span>{formData.selectedWorkshops.length} Workshop{formData.selectedWorkshops.length > 1 ? "s" : ""}</span>
                                                        <span className="font-bold" style={{ color: ACCENT }}>{(formData.selectedWorkshops.length * workshopFee).toLocaleString()} PKR</span>
                                                    </div>
                                                )}
                                                {wantConference && wantWorkshops && formData.selectedWorkshops.length === 2 && category === "FACULTY" && (
                                                    <div className="flex justify-between text-green-400 text-xs text-green-400/90 pt-1">
                                                        <span>Full Event Pass Discount</span>
                                                        <span className="font-bold">-1,000 PKR</span>
                                                    </div>
                                                )}
                                                {wantWorkshops && !isTeam && formData.selectedWorkshops.length === 0 && (
                                                    <div className="flex justify-between text-white/40 text-xs">
                                                        <span>Workshop fee</span>
                                                        <span>{workshopFee.toLocaleString()} PKR each</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-end pt-3 mt-3" style={{ borderTop: "1px solid rgba(59,130,246,0.15)" }}>
                                                <span className="text-white/60 font-semibold text-sm">Total</span>
                                                <span className="text-2xl font-black" style={{ color: ACCENT }}>{calculateTotal().toLocaleString()} <span className="text-sm">PKR</span></span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* ────── STEP 3: Participant Details ────── */}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Participant Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: "name", label: "Full Name", placeholder: "Your full name", value: formData.name, key: "name" as const },
                                        { id: "email", label: "Email Address", placeholder: "you@example.com", value: formData.email, key: "email" as const },
                                        { id: "phone", label: "WhatsApp / Phone", placeholder: "+92 300 0000000", value: formData.phone, key: "phone" as const },
                                    ].map(field => (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor={field.id} className="text-xs font-bold uppercase tracking-wider text-white/30">{field.label}</Label>
                                            <Input
                                                id={field.id}
                                                required
                                                placeholder={field.placeholder}
                                                value={field.value}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                className="h-12 rounded-xl text-white placeholder:text-white/20"
                                                style={{ background: SURFACE, borderColor: BORDER }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Institution */}
                                <div className="space-y-2">
                                    <Label htmlFor="inst" className="text-xs font-bold uppercase tracking-wider text-white/30">Institution</Label>
                                    <Input
                                        id="inst"
                                        value={formData.institution}
                                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                        placeholder="E.g., Northwest School of Medicine"
                                        className="h-12 rounded-xl text-white placeholder:text-white/20"
                                        style={{ background: SURFACE, borderColor: BORDER }}
                                    />
                                </div>

                                {/* Roll Number — only for NWSM students */}
                                {category === "NWSM_STUDENT" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="roll" className="text-xs font-bold uppercase tracking-wider text-white/30">
                                            Roll Number / Student ID <span className="text-blue-400">*</span>
                                        </Label>
                                        <Input
                                            id="roll"
                                            value={formData.rollNumber}
                                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                            placeholder="Required for NWSM students"
                                            required
                                            className="h-12 rounded-xl text-white placeholder:text-white/20"
                                            style={{ background: SURFACE, borderColor: BORDER }}
                                        />
                                    </div>
                                )}

                                {/* Team members */}
                                {isTeam && (
                                    <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                                        <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Team Members</h4>
                                        <p className="text-[10px] text-white/25">You (the registering person) + {category === "OUTSIDER_TEAM_3" ? 2 : 3} team members below</p>
                                        {Array.from({ length: category === "OUTSIDER_TEAM_3" ? 2 : 3 }).map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <Label className="text-xs text-white/30">Member {i + 2} Name</Label>
                                                <Input
                                                    className="h-12 rounded-xl text-white placeholder:text-white/20"
                                                    style={{ background: SURFACE, borderColor: BORDER }}
                                                    placeholder="Full Name"
                                                    value={formData.teamMembers[i]}
                                                    onChange={e => {
                                                        const updated = [...formData.teamMembers];
                                                        updated[i] = e.target.value;
                                                        setFormData({ ...formData, teamMembers: updated });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ────── STEP 4: Payment ────── */}
                        {step === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="rounded-2xl p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                    <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Order Summary</h3>
                                    <div className="space-y-3 mb-6 text-sm">
                                        <div className="flex justify-between text-white/50">
                                            <span>{category ? CATEGORY_INFO[category].label : ""}</span>
                                        </div>

                                        {wantConference && category && (
                                            <div className="flex justify-between text-white/40 text-xs">
                                                <span>Day 2: Main Conference</span>
                                                <span className="font-bold" style={{ color: ACCENT }}>{CONFERENCE_FEE[category].toLocaleString()} PKR</span>
                                            </div>
                                        )}

                                        {wantWorkshops && formData.selectedWorkshops.length > 0 && !isTeam && (
                                            <div className="text-white/40 text-xs space-y-1 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                                                <div className="font-bold uppercase tracking-wider text-[10px] text-white/20 mb-1">Day 1 Workshops</div>
                                                {formData.selectedWorkshops.map(wsId => {
                                                    const ws = WORKSHOPS.find(w => w.id === wsId);
                                                    return ws ? (
                                                        <div key={wsId} className="flex justify-between items-center">
                                                            <span className="flex items-center gap-2">
                                                                <CheckCircle className="w-3 h-3" style={{ color: ACCENT }} />
                                                                {ws.title} ({ws.slot === "morning" ? "Morning" : "Afternoon"})
                                                            </span>
                                                            <span className="font-bold" style={{ color: ACCENT }}>{workshopFee.toLocaleString()} PKR</span>
                                                        </div>
                                                    ) : null;
                                                })}
                                                {wantConference && formData.selectedWorkshops.length === 2 && category === "FACULTY" && (
                                                    <div className="flex justify-between items-center text-green-400/90 pt-1">
                                                        <span className="flex items-center gap-2">
                                                            <CheckCircle className="w-3 h-3" style={{ color: "#4ade80" }} />
                                                            Full Event Pass Discount
                                                        </span>
                                                        <span className="font-bold">-1,000 PKR</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-end pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                                        <span className="text-white font-bold uppercase tracking-wider text-sm">Grand Total</span>
                                        <span className="text-4xl font-black" style={{ color: ACCENT }}>
                                            {calculateTotal().toLocaleString()} <span className="text-base">PKR</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" style={{ color: ACCENT }} /> Payment Instructions
                                    </h3>
                                    <div className="p-4 rounded-xl text-sm text-white/40 leading-relaxed" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                        Transfer the total amount via <strong className="text-white/60">Bank Transfer</strong> or <strong className="text-white/60">Easypaisa</strong>:<br /><br />
                                        <strong className="text-white/60">🏦 Meezan Bank Limited</strong><br />
                                        <strong className="text-white/60">Account Title:</strong> Zahoor Ahmed Khan<br />
                                        <strong className="text-white/60">Account No:</strong> 00300113953149<br />
                                        <strong className="text-white/60">IBAN:</strong> PK56MEZN0000300113953149<br /><br />
                                        <strong className="text-white/60">📱 Easypaisa</strong><br />
                                        <strong className="text-white/60">Number:</strong> 03139802668<br />
                                        <strong className="text-white/60">Account Title:</strong> Zahoor Ahmad Khan<br />
                                        <strong className="text-white/60">IBAN:</strong> PK47TMFB0000000043652207<br /><br />
                                        Upload receipt below after transfer.
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-white/30">Receipt Upload <span className="text-red-400">*</span></Label>
                                    <label
                                        htmlFor="receipt"
                                        className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer group transition-all duration-300"
                                        style={{ border: `2px dashed ${formData.receiptFile ? ACCENT : BORDER}`, background: SURFACE }}
                                    >
                                        <Upload className="w-6 h-6 mb-2 transition-colors" style={{ color: formData.receiptFile ? ACCENT : "#444" }} />
                                        <p className="text-sm text-white/30 group-hover:text-white/60 transition-colors">
                                            <span style={{ color: ACCENT }} className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-white/20 mt-1">PNG, JPG or PDF (MAX 5MB)</p>
                                        <input
                                            id="receipt"
                                            type="file"
                                            className="hidden"
                                            accept="image/png, image/jpeg, application/pdf"
                                            onChange={e => setFormData({ ...formData, receiptFile: e.target.files?.[0] || null })}
                                        />
                                    </label>
                                    {formData.receiptFile && (
                                        <div className="flex items-center gap-2 text-xs text-white/40 mt-2">
                                            <CheckCircle className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                                            <span>{formData.receiptFile.name}</span>
                                        </div>
                                    )}
                                    {!formData.receiptFile && (
                                        <p className="text-[10px] text-red-400/60 mt-1">Payment receipt is required to complete registration</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* ═══ Footer ═══ */}
                <div className="p-6 flex justify-between items-center" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1}
                        className="text-white/30 hover:text-white px-6 rounded-full"
                    >
                        Back
                    </Button>

                    {category && step > 1 && (
                        <div className="text-xs text-white/30 font-medium hidden sm:block">
                            Total: <span className="font-bold" style={{ color: ACCENT }}>{calculateTotal().toLocaleString()} PKR</span>
                        </div>
                    )}

                    {step < totalSteps ? (
                        <button
                            onClick={handleNext}
                            disabled={!canContinue()}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid rgba(59,130,246,0.3)` }}
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !formData.receiptFile}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-full text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50"
                            style={{ background: ACCENT }}
                        >
                            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Complete Registration <ArrowUpRight className="w-4 h-4" /></>}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
