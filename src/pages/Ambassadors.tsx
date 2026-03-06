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
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
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
            <section className="relative min-h-[75vh] sm:min-h-[80vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0c1222 0%, #111827 40%, #0c1222 100%)" }} />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-[0.15]" style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }} />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-[0.08]" style={{ background: "#3b82f6" }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <div
                        className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold tracking-[3px] uppercase px-4 py-2 rounded-full mb-6 sm:mb-8"
                        style={{ background: ACCENT_BG, color: ACCENT_LIGHT, border: `1px solid rgba(59,130,246,0.15)` }}
                    >
                        <Sparkles className="w-3 h-3" /> GSRH × IRTIQA
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-5 sm:mb-6 text-white">
                        Campus{" "}
                        <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Ambassadors</span>
                    </h1>

                    <p className="text-sm sm:text-base md:text-lg text-white/50 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
                        Represent the <strong className="text-white/80">AI Symposium 2026</strong> at your medical college.
                        Build your professional network and unlock exclusive rewards.
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-8 sm:mb-10" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <Shield className="w-3.5 h-3.5" />
                        Only 2 Ambassadors per Medical College
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {!expired ? (
                            <button
                                onClick={scrollToForm}
                                className="group flex items-center gap-2 text-white font-semibold text-sm uppercase tracking-wider px-8 sm:px-10 py-3.5 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                            >
                                Apply Now
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                Applications Closed
                            </div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* ═══════ COUNTDOWN TIMER ═══════ */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pb-16 sm:pb-20">
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
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pb-16 sm:pb-24">
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
            <section ref={formRef} id="apply" className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pb-16 sm:pb-24">
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
                            <p className="text-gray-500 dark:text-white/40 leading-relaxed mb-6">
                                Thank you for applying! Our team will review your application and reach out with the results via WhatsApp or email.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-white/30 mb-6">
                                Join our official WhatsApp group to stay updated on the selection process, important announcements, and connect with other applicants.
                            </p>
                            <a
                                href="https://chat.whatsapp.com/FCrFhpcEZqI1TvoyHi8cLX?mode=gi_t"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,0.3)]"
                                style={{ background: "#25D366" }}
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Join WhatsApp Group
                            </a>
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
                </div>
            </footer>
        </div>
    );
};

export default Ambassadors;
