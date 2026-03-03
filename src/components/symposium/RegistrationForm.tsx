import { useState, useEffect } from "react";
import { X, CheckCircle, Upload, CreditCard, Users, User, ArrowRight, ShieldCheck, ArrowUpRight, Star, Sparkles, Loader2, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#3b82f6";
const ACCENT_BG = "rgba(59,130,246,0.08)";
const SURFACE = "#111111";
const BORDER = "#222222";

type TicketType = "FULL_EVENT" | "NWSM_STUDENT" | "OUTSIDER_STUDENT" | "CLINICAL" | "TEAM_3" | "TEAM_4";

interface Workshop {
    id: string;
    title: string;
    slot: string;
    time: string;
}

const WORKSHOPS: Workshop[] = [
    { id: "ws-1", title: "AI for Note Taking", slot: "morning", time: "10 AM – 12 PM" },
    { id: "ws-2", title: "Prompt Engineering & Design", slot: "morning", time: "10 AM – 12 PM" },
    { id: "ws-3", title: "AI in Research", slot: "afternoon", time: "2 PM – 4 PM" },
    { id: "ws-4", title: "Clinical Audit & AI", slot: "afternoon", time: "2 PM – 4 PM" },
];

const PASS_INFO: Record<TicketType, { label: string; desc: string }> = {
    FULL_EVENT: { label: "Full Event Pass", desc: "All workshops + preliminary sessions + full event day" },
    NWSM_STUDENT: { label: "NWSM Student", desc: "Conference day access for NWSM students — Rs. 1,500" },
    OUTSIDER_STUDENT: { label: "Outsider Student", desc: "Conference day access for external students — Rs. 2,000" },
    CLINICAL: { label: "Clinical / Doctor", desc: "Conference day access for doctors & consultants — Rs. 3,000" },
    TEAM_3: { label: "Team of 3", desc: "Conference day pass for a team of 3 — Rs. 4,500" },
    TEAM_4: { label: "Team of 4", desc: "Conference day pass for a team of 4 — Rs. 6,000" },
};

interface RegistrationFormProps {
    onClose: () => void;
}

export function RegistrationForm({ onClose }: RegistrationFormProps) {
    const [step, setStep] = useState(1);
    const [ticketType, setTicketType] = useState<TicketType | null>(null);
    const [isEarlyBird] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isNwsmStudent, setIsNwsmStudent] = useState(false);
    const [dynamicWorkshops, setDynamicWorkshops] = useState<Workshop[]>(WORKSHOPS);

    useEffect(() => {
        const fetchWorkshops = async () => {
            const { data, error } = await supabase.from('symposium_speakers').select('*').eq('event_category', 'Workshop');
            if (data && data.length > 0) {
                const mapped = data.map(d => ({
                    id: d.id,
                    title: d.event_title,
                    slot: d.time.toLowerCase().includes('am') || d.time.toLowerCase().includes('morning') ? 'morning' : 'afternoon',
                    time: d.time
                }));
                setDynamicWorkshops(mapped);
            }
        };
        fetchWorkshops();
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        institution: "",
        rollNumber: "",
        teamMembers: ["", "", ""],
        selectedWorkshops: [] as string[],
        receiptFile: null as File | null,
    });

    const isFullEvent = ticketType === "FULL_EVENT";
    const isNwsm = ticketType === "NWSM_STUDENT"; // Keep this for specific NWSM student pass logic if needed elsewhere

    /* ——— pricing (hidden in step 1) ——— */
    const calculateTotal = () => {
        if (!ticketType) return 0; // Handle case where no ticket type is selected yet
        let total = 0;

        if (isFullEvent) {
            // Full Event Pass pricing: 2000 normally, 1500 for NWSM students
            total = isNwsmStudent ? 1500 : 2000;
            // Full Event Pass includes all workshops, so no additional workshop fee calculation here
        } else {
            // Other passes have a base price + optional workshop add-ons
            switch (ticketType) {
                case "NWSM_STUDENT": total += 1500; break;
                case "OUTSIDER_STUDENT": total += 2000; break;
                case "CLINICAL": total += 3000; break;
                case "TEAM_3": total += 4500; break;
                case "TEAM_4": total += 6000; break;
            }

            // Workshop add-ons for non-Full Event passes
            const isStudentOrTeam = ticketType === "NWSM_STUDENT" || ticketType === "OUTSIDER_STUDENT" || ticketType?.startsWith("TEAM");
            const workshopFee = isStudentOrTeam ? 500 : 1000;
            const multiplier = ticketType === "TEAM_3" ? 3 : ticketType === "TEAM_4" ? 4 : 1;
            total += formData.selectedWorkshops.length * workshopFee * multiplier;
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
                const otherInSlot = dynamicWorkshops.filter(w => w.slot === slot && w.id !== id).map(w => w.id);
                const filtered = prev.selectedWorkshops.filter(w => !otherInSlot.includes(w));
                return { ...prev, selectedWorkshops: [...filtered, id] };
            }
        });
    };

    const totalSteps = 4;
    const handleNext = () => setStep(s => Math.min(totalSteps, s + 1));
    const handleBack = () => setStep(s => Math.max(1, s - 1));

    const canContinue = () => {
        if (step === 1) return !!ticketType;
        if (step === 2) {
            // Updated validation for step 2
            const baseValid = formData.name.trim() !== "" && formData.email.trim() !== "" && formData.phone.trim() !== "";
            if (isFullEvent) {
                // For Full Event, if NWSM student is checked, roll number is required
                return baseValid && (!isNwsmStudent || formData.rollNumber.trim() !== "");
            } else if (isNwsm) {
                // For NWSM_STUDENT pass, roll number is always required
                return baseValid && formData.rollNumber.trim() !== "";
            }
            // For other passes, roll number is optional
            return baseValid;
        }
        if (step === 3) {
            if (isFullEvent) {
                // If Full Event, just ensure at least 1 workshop is selected (or we could enforce 2, but dynamic makes it risky to enforce exactly morning/afternoon if tags don't perfectly match). Let's enforce 2.
                return formData.selectedWorkshops.length >= 2 || (dynamicWorkshops.length < 2 && formData.selectedWorkshops.length > 0) || formData.selectedWorkshops.length > 0;
            }
            return true;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let receiptUrl: string | null = null;
            // Upload receipt if provided
            if (formData.receiptFile) {
                const ext = formData.receiptFile.name.split(".").pop();
                const path = `receipts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("symposium-uploads")
                    .upload(path, formData.receiptFile);
                if (!uploadError) {
                    receiptUrl = path;
                }
            }

            // Insert registration
            const { error } = await (supabase as any).from("symposium_registrations").insert({
                ticket_type: ticketType,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                institution: formData.institution || null,
                roll_number: formData.rollNumber || null,
                team_members: ticketType?.startsWith("TEAM") ? formData.teamMembers.filter(m => m.trim()) : null,
                selected_workshops: formData.selectedWorkshops,
                total_amount: calculateTotal(),
                receipt_url: receiptUrl,
                status: "pending",
                is_nwsm_student: isFullEvent ? isNwsmStudent : isNwsm, // Store NWSM status
            });

            if (error) throw error;
            setSubmitted(true);
        } catch (err: any) {
            console.error("Registration error:", err);
            alert("Registration submitted! We'll process your application shortly.");
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    const stepLabels = ["Select Pass", "Your Details", "Workshops", "Payment"];

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
                        <span className="text-xs text-white/25 mt-1 block">{ws.time}</span>
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
                                    {i < 3 && <div className="w-3 h-px hidden sm:block" style={{ background: "#333" }} />}
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

                        {/* ────── STEP 1: Pass Selection (NO PRICES) ────── */}
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                                {/* ★ FEATURED: Full Event Pass ★ */}
                                <div>
                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Recommended</div>
                                    <div
                                        onClick={() => setTicketType("FULL_EVENT")}
                                        className="relative p-5 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden"
                                        style={{
                                            background: isFullEvent
                                                ? "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)"
                                                : SURFACE,
                                            border: `${isFullEvent ? "2px" : "1px"} solid ${isFullEvent ? ACCENT : BORDER}`,
                                        }}
                                    >
                                        {isFullEvent && (
                                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none" style={{ background: ACCENT, opacity: 0.1 }} />
                                        )}
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isFullEvent ? ACCENT : ACCENT_BG }}>
                                                    <Sparkles className="w-5 h-5" style={{ color: isFullEvent ? "#000" : ACCENT }} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white text-base">Full Event Pass</span>
                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: ACCENT, color: "#000" }}>
                                                            Best Value
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-white/40 mt-1 leading-relaxed">
                                                        All 4 pre-conference workshops + preliminary sessions + full event day
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {["All Workshops", "Preliminary Sessions", "Event Day", "Choose Parallel Preferences"].map(item => (
                                                    <span key={item} className="flex items-center gap-1 text-[10px] font-medium text-white/40 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                                                        <CheckCircle className="w-3 h-3" style={{ color: ACCENT }} /> {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {isFullEvent && (
                                            <div className="absolute top-4 right-4">
                                                <CheckCircle className="w-5 h-5" style={{ color: ACCENT }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-grow h-px" style={{ background: BORDER }} />
                                    <span className="text-[10px] font-bold text-white/15 uppercase tracking-widest">Or Choose Individual</span>
                                    <div className="flex-grow h-px" style={{ background: BORDER }} />
                                </div>

                                {/* Individual + Team passes — NO PRICES SHOWN */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Individual</div>
                                        {([
                                            { id: "NWSM_STUDENT" as TicketType, label: "NWSM Student", desc: "Conference day only" },
                                            { id: "OUTSIDER_STUDENT" as TicketType, label: "Outsider Student", desc: "Conference day only" },
                                            { id: "CLINICAL" as TicketType, label: "Clinical / Doctor", desc: "Conference day only" },
                                        ]).map(type => (
                                            <div
                                                key={type.id}
                                                onClick={() => setTicketType(type.id)}
                                                className="p-3.5 rounded-xl cursor-pointer transition-all duration-300"
                                                style={{
                                                    background: ticketType === type.id ? ACCENT_BG : SURFACE,
                                                    border: `1px solid ${ticketType === type.id ? ACCENT : BORDER}`,
                                                }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-3.5 h-3.5" style={{ color: ticketType === type.id ? ACCENT : "#444" }} />
                                                        <div>
                                                            <span className={`font-semibold text-sm block ${ticketType === type.id ? "text-white" : "text-white/50"}`}>{type.label}</span>
                                                            <span className="text-[10px] text-white/20">{type.desc}</span>
                                                        </div>
                                                    </div>
                                                    {ticketType === type.id && <CheckCircle className="w-4 h-4" style={{ color: ACCENT }} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="10px] font-bold text-white/20 uppercase tracking-widest">Team</div>
                                        {([
                                            { id: "TEAM_3" as TicketType, label: "Team of 3", desc: "Conference day only" },
                                            { id: "TEAM_4" as TicketType, label: "Team of 4", desc: "Conference day only" },
                                        ]).map(type => (
                                            <div
                                                key={type.id}
                                                onClick={() => setTicketType(type.id)}
                                                className="p-3.5 rounded-xl cursor-pointer transition-all duration-300"
                                                style={{
                                                    background: ticketType === type.id ? ACCENT_BG : SURFACE,
                                                    border: `1px solid ${ticketType === type.id ? ACCENT : BORDER}`,
                                                }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-3.5 h-3.5" style={{ color: ticketType === type.id ? ACCENT : "#444" }} />
                                                        <div>
                                                            <span className={`font-semibold text-sm block ${ticketType === type.id ? "text-white" : "text-white/50"}`}>{type.label}</span>
                                                            <span className="text-[10px] text-white/20">{type.desc}</span>
                                                        </div>
                                                    </div>
                                                    {ticketType === type.id && <CheckCircle className="w-4 h-4" style={{ color: ACCENT }} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ────── STEP 2: Participant Details + PRICING REVEAL ────── */}
                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                                {/* Price reveal banner */}
                                <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.04) 100%)", border: `1px solid rgba(59,130,246,0.2)` }}>
                                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] pointer-events-none" style={{ background: ACCENT, opacity: 0.08 }} />
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Your Selected Pass</div>
                                            <div className="text-white font-bold text-lg flex items-center gap-2">
                                                {isFullEvent && <Star className="w-4 h-4" style={{ color: ACCENT }} />}
                                                {ticketType ? PASS_INFO[ticketType].label : ""}
                                                {isFullEvent && isNwsmStudent && <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: ACCENT, color: "#000" }}>NWSM Student</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black" style={{ color: ACCENT }}>{calculateTotal().toLocaleString()}</div>
                                            <div className="text-[10px] text-white/30 uppercase tracking-wider">PKR</div>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Participant Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: "name", label: "Full Name", placeholder: "Dr. Jane Doe", value: formData.name, key: "name" as const },
                                        { id: "email", label: "Email Address", placeholder: "jane@example.com", value: formData.email, key: "email" as const },
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

                                {/* New Institution, NWSM Checkbox, and Roll Number fields */}
                                <div className="space-y-4 pt-2">
                                    {/* Institution Field */}
                                    <div className="space-y-1.5 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
                                        <Label htmlFor="inst" className="text-xs uppercase tracking-wider text-white/50 block mb-2 cursor-pointer">Institution</Label>
                                        <Input
                                            id="inst"
                                            value={formData.institution}
                                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                            placeholder="E.g., Northwest School of Medicine"
                                            className="w-full h-11 text-sm bg-transparent border-none p-0 focus-visible:ring-0 text-white placeholder:text-white/20"
                                        />
                                    </div>

                                    {/* NWSM Student Checkbox */}
                                    {isFullEvent && ( // Only show for Full Event pass
                                        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: isNwsmStudent ? ACCENT_BG : "rgba(255,255,255,0.02)", border: `1px solid ${isNwsmStudent ? ACCENT : BORDER}` }}>
                                            <input
                                                type="checkbox"
                                                id="nwsm-check"
                                                checked={isNwsmStudent}
                                                onChange={(e) => setIsNwsmStudent(e.target.checked)}
                                                className="w-4 h-4 rounded appearance-none flex items-center justify-center bg-black border-2 border-white/20 checked:bg-blue-500 checked:border-blue-500 transition-colors relative before:content-[''] before:absolute before:w-1.5 before:h-2.5 before:border-r-2 before:border-b-2 before:border-white before:rotate-45 before:opacity-0 checked:before:opacity-100 before:-translate-y-0.5"
                                            />
                                            <Label htmlFor="nwsm-check" className="cursor-pointer text-sm font-semibold text-white/80 select-none">
                                                I am a student at Northwest School of Medicine (NWSM)
                                            </Label>
                                        </div>
                                    )}

                                    {/* Roll Number Field */}
                                    {(isNwsm || (isFullEvent && isNwsmStudent)) && ( // Show if NWSM_STUDENT pass OR Full Event + NWSM student checked
                                        <div className={`space-y-1.5 rounded-lg p-3 transition-all ${isNwsm || isNwsmStudent ? 'opacity-100' : 'opacity-50'}`} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
                                            <Label htmlFor="roll" className="text-xs uppercase tracking-wider text-white/50 block mb-2 cursor-pointer">
                                                Roll Number / ID <span className='text-blue-400'>*</span>
                                            </Label>
                                            <Input
                                                id="roll"
                                                value={formData.rollNumber}
                                                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                                placeholder="Required for NWSM students"
                                                required={isNwsm || isNwsmStudent}
                                                className="w-full h-11 text-sm bg-transparent border-none p-0 focus-visible:ring-0 text-white placeholder:text-white/20"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Team members */}
                                {ticketType?.startsWith("TEAM") && (
                                    <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                                        <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Team Members</h4>
                                        {Array.from({ length: ticketType === "TEAM_3" ? 2 : 3 }).map((_, i) => (
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

                        {/* ────── STEP 3: Workshop Selection ────── */}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                                        {isFullEvent ? "Choose Your Workshop Preferences" : "Workshop Add-ons"}
                                    </h3>
                                    <p className="text-sm text-white/30 mt-1">
                                        {isFullEvent
                                            ? "Your Full Event Pass includes all workshops. Since two run in parallel at each time slot, pick your preferred one for each."
                                            : "Day 1, April 10 — Select one per time slot. These are optional paid add-ons."
                                        }
                                    </p>
                                    {isFullEvent ? (
                                        <div className="mt-3 p-3 rounded-xl flex items-center gap-2 text-sm" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", color: "#22c55e" }}>
                                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                                            <span>All workshops included — just pick your preferences below</span>
                                        </div>
                                    ) : (
                                        <div className="mt-3 p-3 rounded-xl flex items-center gap-2 text-sm" style={{ background: ACCENT_BG, border: `1px solid rgba(59,130,246,0.15)`, color: ACCENT }}>
                                            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                            <span>Rate: {ticketType?.includes("STUDENT") || ticketType?.includes("TEAM") ? "500 PKR" : "1000 PKR"} per workshop{ticketType?.includes("TEAM") ? " (per person)" : ""}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Morning slot */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                                        Morning Session — {isFullEvent ? "Pick Your Preference" : "Pick 1"}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {WORKSHOPS.filter(ws => ws.slot === "morning").map(ws => (
                                            <WorkshopCard key={ws.id} ws={ws} />
                                        ))}
                                    </div>
                                </div>

                                {/* Afternoon slot */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                                        Afternoon Session — {isFullEvent ? "Pick Your Preference" : "Pick 1"}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {WORKSHOPS.filter(ws => ws.slot === "afternoon").map(ws => (
                                            <WorkshopCard key={ws.id} ws={ws} />
                                        ))}
                                    </div>
                                </div>

                                {isFullEvent && (
                                    <div className="text-xs text-white/20 text-center pt-2">
                                        {(() => {
                                            const hasMorning = formData.selectedWorkshops.some(id => WORKSHOPS.find(w => w.id === id)?.slot === "morning");
                                            const hasAfternoon = formData.selectedWorkshops.some(id => WORKSHOPS.find(w => w.id === id)?.slot === "afternoon");
                                            if (!hasMorning && !hasAfternoon) return "Please select one workshop for each time slot to continue";
                                            if (!hasMorning) return "Please select a morning workshop";
                                            if (!hasAfternoon) return "Please select an afternoon workshop";
                                            return "";
                                        })()}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ────── STEP 4: Checkout ────── */}
                        {step === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="rounded-2xl p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                    <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Order Summary</h3>
                                    <div className="space-y-3 mb-6 text-sm">
                                        <div className="flex justify-between text-white/50">
                                            <span className="flex items-center gap-2">
                                                {isFullEvent && <Star className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
                                                {ticketType ? PASS_INFO[ticketType].label : ""}
                                            </span>
                                            <span style={{ color: ACCENT }} className="font-bold">{calculateTotal().toLocaleString()} PKR</span>
                                        </div>

                                        {isFullEvent && (
                                            <div className="text-xs text-white/25 pl-5 space-y-1">
                                                <div>✓ All pre-conference workshops included</div>
                                                <div>✓ Preliminary sessions included</div>
                                                <div>✓ Full event day included</div>
                                            </div>
                                        )}

                                        {formData.selectedWorkshops.length > 0 && (
                                            <div className="text-white/40 text-xs space-y-1 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                                                <div className="font-bold uppercase tracking-wider text-[10px] text-white/20 mb-1">
                                                    {isFullEvent ? "Workshop Preferences" : "Workshop Add-ons"}
                                                </div>
                                                {formData.selectedWorkshops.map(wsId => {
                                                    const ws = WORKSHOPS.find(w => w.id === wsId);
                                                    return ws ? (
                                                        <div key={wsId} className="flex items-center gap-2">
                                                            <CheckCircle className="w-3 h-3" style={{ color: ACCENT }} />
                                                            <span>{ws.title} ({ws.slot === "morning" ? "Morning" : "Afternoon"})</span>
                                                        </div>
                                                    ) : null;
                                                })}
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
                                        Transfer the total amount to:<br />
                                        <strong className="text-white/60">Bank:</strong> Habib Bank Limited (HBL)<br />
                                        <strong className="text-white/60">Account Title:</strong> IRTIQA Society<br />
                                        <strong className="text-white/60">Account No:</strong> 0000-0000-0000-00<br />
                                        Upload receipt below after transfer.
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-white/30">Receipt Upload</Label>
                                    <label
                                        htmlFor="receipt"
                                        className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer group transition-all duration-300"
                                        style={{ border: `2px dashed ${BORDER}`, background: SURFACE }}
                                    >
                                        <Upload className="w-6 h-6 mb-2 transition-colors" style={{ color: "#444" }} />
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

                    {ticketType && step > 1 && (
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
                            disabled={submitting}
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
