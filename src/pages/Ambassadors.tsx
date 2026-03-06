import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Award, Users, Globe, Zap, CheckCircle, ArrowUpRight, Clock,
    ChevronDown, Shield, Gift, Network, Star, Send, Loader2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/* ═══════ palette (matching symposium) ═══════ */
const ACCENT = "#3b82f6";
const ACCENT_LIGHT = "#60a5fa";
const BORDER = "rgba(255,255,255,0.06)";
const SURFACE = "rgba(255,255,255,0.02)";
const ACCENT_BG = "rgba(59,130,246,0.08)";

/* ═══════ deadline: 8 March 2026, 11:59 PM PKT (UTC+5) ═══════ */
const DEADLINE = new Date("2026-03-08T23:59:00+05:00").getTime();

/* ═══════ perks data ═══════ */
const PERKS = [
    {
        icon: <Gift className="w-6 h-6" />,
        title: "Cash Prizes & Shields",
        desc: "Top 3 performing ambassadors receive exclusive cash prizes and official Symposium shields — presented on stage.",
        gradient: "from-amber-500/20 to-orange-500/20",
        border: "border-amber-500/20",
    },
    {
        icon: <Award className="w-6 h-6" />,
        title: "Global Surgery LOR",
        desc: "Earn an official Letter of Recommendation from the Global Surgery Directorate — a high-value credential for your CV.",
        gradient: "from-blue-500/20 to-cyan-500/20",
        border: "border-blue-500/20",
    },
    {
        icon: <Star className="w-6 h-6" />,
        title: "Free VIP Access",
        desc: "Top performers get 100% free VIP Delegate passes to all future IRTIQA events, workshops, and debates.",
        gradient: "from-purple-500/20 to-pink-500/20",
        border: "border-purple-500/20",
    },
    {
        icon: <Network className="w-6 h-6" />,
        title: "Exclusive Networking",
        desc: "Direct access to our expert speaker panel, surgeons, and future collaboration opportunities with IRTIQA & GSRH.",
        gradient: "from-emerald-500/20 to-teal-500/20",
        border: "border-emerald-500/20",
    },
];

/* ═══════ year options ═══════ */
const YEAR_OPTIONS = [
    "1st Year (MBBS/BDS)",
    "2nd Year (MBBS/BDS)",
    "3rd Year (MBBS/BDS)",
    "4th Year (MBBS/BDS)",
    "Final Year (MBBS/BDS)",
    "House Officer / Intern",
];

/* ═══════ countdown hook ═══════ */
function useCountdown(target: number) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, expired: diff === 0 };
}

/* ═══════ main component ═══════ */
const Ambassadors = () => {
    const { toast } = useToast();
    const formRef = useRef<HTMLDivElement>(null);
    const { days, hours, minutes, seconds, expired } = useCountdown(DEADLINE);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        whatsapp: "",
        social_url: "",
        institution: "",
        year_of_study: "",
        leadership_experience: "",
        promotional_strategy: "",
    });

    const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (expired) {
            toast({ title: "Applications Closed", description: "The deadline has passed.", variant: "destructive" });
            return;
        }
        setSubmitting(true);
        try {
            const { error } = await (supabase as any)
                .from("symposium_ambassador_applications")
                .insert({
                    ...form,
                    status: "pending",
                });
            if (error) throw error;
            setSubmitted(true);
            toast({ title: "Application Submitted!", description: "We'll review your application and get back to you soon." });
        } catch (err: any) {
            console.error("Ambassador form error:", err);
            toast({ title: "Submission Failed", description: err.message || "Please try again.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

            {/* ═══════ HERO ═══════ */}
            <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-12 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-10" style={{ background: ACCENT }} />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] opacity-8" style={{ background: "#a855f7" }} />
                    <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative z-10 max-w-4xl"
                >
                    <div
                        className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[4px] uppercase px-5 py-2.5 rounded-full mb-8"
                        style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid rgba(59,130,246,0.2)` }}
                    >
                        <Sparkles className="w-3 h-3" /> Exclusive Opportunity
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase leading-[0.9] mb-6">
                        Campus<br />
                        <span style={{ color: ACCENT }}>Ambassadors</span>
                    </h1>

                    <p className="text-gray-500 dark:text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                        Represent the <strong className="text-foreground">AI Symposium 2026</strong> at your medical college.
                        Lead the future of medical innovation, build your professional network, and unlock exclusive high-yield rewards.
                    </p>

                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mb-10" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <Shield className="w-4 h-4" />
                        Highly Competitive — Only 2 Ambassadors per Medical College
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {!expired ? (
                            <button
                                onClick={scrollToForm}
                                className="group flex items-center gap-3 text-black font-bold text-sm uppercase tracking-widest px-10 py-5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]"
                                style={{ background: ACCENT }}
                            >
                                Apply Now
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                Applications Closed
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] uppercase tracking-[3px] text-white/20 font-bold">Scroll</span>
                    <div className="w-5 h-8 rounded-full border border-white/10">
                        <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 bg-white/30 rounded-full mx-auto mt-1" />
                    </div>
                </motion.div>
            </section>

            {/* ═══════ COUNTDOWN TIMER ═══════ */}
            <section className="max-w-[1400px] mx-auto px-6 md:px-12 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-3xl p-8 md:p-12"
                    style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e3a5f 100%)", border: "1px solid rgba(59,130,246,0.2)" }}
                >
                    {/* deco */}
                    <div className="absolute top-0 left-0 w-60 h-60 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent)", transform: "translate(-30%, -30%)" }} />
                    <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.4), transparent)", transform: "translate(30%, 30%)" }} />
                    <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[4px] uppercase px-4 py-2 rounded-full mb-6" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                            <Clock className="w-3 h-3" /> Application Deadline
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase mb-2">
                            {expired ? "Applications Closed" : "Applications Closing Soon"}
                        </h2>
                        <p className="text-white/30 text-sm mb-8">March 8, 2026 — 11:59 PM PKT</p>

                        {!expired ? (
                            <div className="flex justify-center gap-4 md:gap-6">
                                {[
                                    { value: days, label: "Days" },
                                    { value: hours, label: "Hours" },
                                    { value: minutes, label: "Minutes" },
                                    { value: seconds, label: "Seconds" },
                                ].map((unit) => (
                                    <div key={unit.label} className="min-w-[80px] md:min-w-[100px]">
                                        <div className="rounded-2xl p-4 md:p-6 mb-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
                                            <span className="text-4xl md:text-6xl font-black text-white tabular-nums">
                                                {String(unit.value).padStart(2, "0")}
                                            </span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[3px] text-white/30 font-bold">{unit.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-red-400">Deadline Passed</div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* ═══════ PERKS ═══════ */}
            <section className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold tracking-[4px] uppercase mb-4" style={{ color: ACCENT }}>Why Apply</p>
                    <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight">
                        High-Yield <span style={{ color: ACCENT }}>Perks</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PERKS.map((perk, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`group rounded-2xl p-8 border ${perk.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                            style={{ background: SURFACE }}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${perk.gradient} flex items-center justify-center mb-5`}>
                                <span style={{ color: ACCENT }}>{perk.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">{perk.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">{perk.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════ APPLICATION FORM ═══════ */}
            <section ref={formRef} id="apply" className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold tracking-[4px] uppercase mb-4" style={{ color: ACCENT }}>Official Application</p>
                    <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight">
                        Apply <span style={{ color: ACCENT }}>Now</span>
                    </h2>
                    <p className="text-gray-500 dark:text-white/40 mt-4 max-w-lg mx-auto">
                        Complete the form below. Applications are reviewed on a rolling basis — apply early for a competitive edge.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {expired ? (
                        <motion.div
                            key="closed"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto rounded-3xl p-12 md:p-16 text-center"
                            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                        >
                            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: ACCENT_BG }}>
                                <CheckCircle className="w-10 h-10" style={{ color: ACCENT }} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-foreground mb-4 uppercase">Applications Closed</h3>
                            <p className="text-gray-500 dark:text-white/40 leading-relaxed text-lg mb-4">
                                We received a <strong className="text-foreground">tremendous response</strong> from medical colleges across the country.
                            </p>
                            <p className="text-gray-500 dark:text-white/40 leading-relaxed mb-8">
                                Our team is currently evaluating all applications. Selected ambassadors will be contacted via WhatsApp and email within the next few days. Stay tuned!
                            </p>
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid rgba(59,130,246,0.2)` }}>
                                <Sparkles className="w-4 h-4" />
                                Results Coming Soon
                            </div>
                        </motion.div>
                    ) : submitted ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-xl mx-auto rounded-3xl p-12 text-center"
                            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                        >
                            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)" }}>
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-3 uppercase">Application Received!</h3>
                            <p className="text-gray-500 dark:text-white/40 leading-relaxed">
                                Thank you for applying. Our team will review your application and contact you via WhatsApp or email.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="max-w-3xl mx-auto rounded-3xl p-8 md:p-12 space-y-10"
                            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                        >
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[3px] mb-6" style={{ color: ACCENT }}>
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Full Name *</label>
                                        <input
                                            required
                                            value={form.full_name}
                                            onChange={(e) => update("full_name", e.target.value)}
                                            className="w-full bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            style={{ borderColor: BORDER }}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Email Address *</label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => update("email", e.target.value)}
                                            className="w-full bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            style={{ borderColor: BORDER }}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">WhatsApp Number *</label>
                                        <input
                                            required
                                            value={form.whatsapp}
                                            onChange={(e) => update("whatsapp", e.target.value)}
                                            className="w-full bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            style={{ borderColor: BORDER }}
                                            placeholder="+92 300 1234567"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">LinkedIn / Instagram URL</label>
                                        <input
                                            value={form.social_url}
                                            onChange={(e) => update("social_url", e.target.value)}
                                            className="w-full bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            style={{ borderColor: BORDER }}
                                            placeholder="https://linkedin.com/in/yourprofile"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[3px] mb-6" style={{ color: ACCENT }}>
                                    Academic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Medical College / Institution *</label>
                                        <input
                                            required
                                            value={form.institution}
                                            onChange={(e) => update("institution", e.target.value)}
                                            className="w-full bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            style={{ borderColor: BORDER }}
                                            placeholder="Full name of your institution"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Year of Study *</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={form.year_of_study}
                                                onChange={(e) => update("year_of_study", e.target.value)}
                                                className="w-full bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                                style={{ borderColor: BORDER }}
                                            >
                                                <option value="" disabled>Select your year</option>
                                                {YEAR_OPTIONS.map((y) => (
                                                    <option key={y} value={y} className="bg-[#0e0e0e]">{y}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Evaluation Questions */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[3px] mb-6" style={{ color: ACCENT }}>
                                    Evaluation Questions
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">
                                            Previous Leadership or PR Experience *
                                        </label>
                                        <p className="text-[11px] text-white/20 mb-3 italic">
                                            Tell us about events you have organized, societies you lead, or your network reach. Be specific — mention roles, event sizes, and outcomes. This carries high weight.
                                        </p>
                                        <textarea
                                            required
                                            rows={4}
                                            value={form.leadership_experience}
                                            onChange={(e) => update("leadership_experience", e.target.value)}
                                            className="w-full bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                            style={{ borderColor: BORDER }}
                                            placeholder="Describe your leadership experience, roles, and outcomes..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">
                                            Your Promotional Strategy *
                                        </label>
                                        <p className="text-[11px] text-white/20 mb-3 italic">
                                            How exactly do you plan to get maximum registrations from your college? We're looking for proactive planners — give us a brief, actionable strategy.
                                        </p>
                                        <textarea
                                            required
                                            rows={4}
                                            value={form.promotional_strategy}
                                            onChange={(e) => update("promotional_strategy", e.target.value)}
                                            className="w-full bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                            style={{ borderColor: BORDER }}
                                            placeholder="WhatsApp groups, class pitches, social media campaigns..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={submitting || expired}
                                    className="w-full font-bold h-14 text-base uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                                    style={{ background: expired ? "#333" : ACCENT, color: expired ? "#888" : "#000" }}
                                >
                                    {submitting ? (
                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
                                    ) : expired ? (
                                        "Applications Closed"
                                    ) : (
                                        <><Send className="w-4 h-4 mr-2" /> Submit Application</>
                                    )}
                                </Button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </section>

            {/* ═══════ FOOTER ═══════ */}
            <footer className="border-t py-8 px-6 md:px-12" style={{ borderColor: BORDER }}>
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: ACCENT }} />
                        <span className="text-sm font-bold uppercase tracking-widest">GSRH × IRTIQA</span>
                    </div>
                    <span className="text-xs text-white/20">AI Symposium 2026 — Campus Ambassador Program</span>
                </div>
            </footer>
        </div>
    );
};

export default Ambassadors;
