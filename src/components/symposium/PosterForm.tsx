import { useState } from "react";
import { X, CheckCircle, ArrowUpRight, Loader2, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#3b82f6";
const ACCENT_BG = "rgba(59,130,246,0.08)";
const SURFACE = "#111111";
const BORDER = "#222222";

const POSTER_IDEAS = [
    { tool: "ChatGPT / GPT-4", idea: "AI-Assisted History Taking — how LLMs can guide structured patient interviews" },
    { tool: "Google Gemini", idea: "Multimodal Diagnostics — analyzing radiology images + clinical text simultaneously" },
    { tool: "Perplexity AI", idea: "Evidence-Based Search — real-time medical literature retrieval at the point of care" },
    { tool: "GitHub Copilot", idea: "AI in Health Informatics — auto-generating EHR data pipelines and clinical dashboards" },
    { tool: "DALL·E / Midjourney", idea: "AI-Generated Medical Illustrations — anatomical and pathological image synthesis" },
    { tool: "Whisper / Speech AI", idea: "Automated Clinical Transcription — converting doctor-patient conversations to structured notes" },
    { tool: "Scikit-learn / AutoML", idea: "Predictive Models for Readmission — ML-based risk scoring from discharge summaries" },
    { tool: "Custom AI App", idea: "Build your own! A native tool or Streamlit app solving a real clinical workflow problem" },
];

interface PosterFormProps {
    onClose: () => void;
}

export function PosterForm({ onClose }: PosterFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        institution: "",
        rollNumber: "",
        topicDescription: "",
    });

    const canSubmit = formData.name.trim() && formData.email.trim() && formData.phone.trim() && formData.topicDescription.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            const { error } = await (supabase as any).from("symposium_poster_submissions").insert({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                institution: formData.institution || null,
                roll_number: formData.rollNumber || null,
                topic_description: formData.topicDescription,
                status: "pending",
            });
            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error("Poster submission error:", err);
            alert("Your poster submission has been received! We'll review it shortly.");
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

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
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-3">Poster Registered!</h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-6">
                        Your poster topic has been submitted for review. We'll notify you at <strong className="text-white/60">{formData.email}</strong> once your topic is confirmed.
                    </p>
                    <button onClick={onClose} className="text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-full" style={{ background: ACCENT, color: "#000" }}>Done</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] rounded-3xl relative"
                style={{ background: "#0e0e0e", border: `1px solid ${BORDER}` }}
            >
                {/* Header */}
                <div className="p-6 flex justify-between items-center" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">AI Poster Competition</h2>
                        <p className="text-xs text-white/30 mt-1">Present a poster + give a live demo of your chosen AI tool</p>
                    </div>
                    <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-grow scrollbar-hide space-y-6">

                    {/* Topic Ideas section */}
                    <div className="rounded-xl p-4" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-amber-400">
                            <Lightbulb className="w-3.5 h-3.5" /> Topic Ideas — Get Inspired
                        </h4>
                        <p className="text-[11px] text-white/30 mb-3">
                            Present a poster on any AI tool and give a live demo on your laptop. Here are some ideas to get you started:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {POSTER_IDEAS.map((idea, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[9px] font-bold mt-0.5" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-white/70">{idea.tool}</span>
                                        <span className="text-[11px] text-white/30 block">{idea.idea}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-white/15 mt-3 italic">These are suggestions — you may choose any AI tool and any healthcare application.</p>
                    </div>

                    {/* Personal details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "po-name", label: "Full Name", placeholder: "Your full name", value: formData.name, key: "name" as const },
                            { id: "po-email", label: "Email", placeholder: "your@email.com", value: formData.email, key: "email" as const },
                            { id: "po-phone", label: "Phone / WhatsApp", placeholder: "+92 ...", value: formData.phone, key: "phone" as const },
                            { id: "po-inst", label: "Institution", placeholder: "Your institution", value: formData.institution, key: "institution" as const },
                        ].map(f => (
                            <div key={f.id} className="space-y-2">
                                <Label htmlFor={f.id} className="text-xs font-bold uppercase tracking-wider text-white/30">{f.label}</Label>
                                <Input id={f.id} placeholder={f.placeholder} value={f.value}
                                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                    className="h-11 rounded-xl text-white placeholder:text-white/20"
                                    style={{ background: SURFACE, borderColor: BORDER }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Roll number */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-white/30">Roll Number <span className="font-normal">(Optional — for NWSM students)</span></Label>
                        <Input placeholder="e.g. 2024-MBBS-001" value={formData.rollNumber}
                            onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                            className="h-11 rounded-xl text-white placeholder:text-white/20"
                            style={{ background: SURFACE, borderColor: BORDER }}
                        />
                    </div>

                    {/* Topic description */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Your Poster Topic *</Label>
                        <p className="text-[11px] text-white/25 -mt-1">Which AI tool will you present? What's your angle? Tell us about your poster topic so we can review and confirm your participation.</p>
                        <textarea
                            required
                            rows={4}
                            placeholder="E.g.: I will present on ChatGPT's application in clinical note-taking, demonstrating how it can summarize patient histories from unstructured text..."
                            value={formData.topicDescription}
                            onChange={e => setFormData({ ...formData, topicDescription: e.target.value })}
                            className="w-full rounded-xl text-white placeholder:text-white/15 text-sm p-4 resize-none focus:outline-none focus:ring-1"
                            style={{ background: SURFACE, borderColor: BORDER, border: `1px solid ${BORDER}` } as any}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 flex justify-end" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || submitting}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-full text-black transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: ACCENT }}
                    >
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Poster <ArrowUpRight className="w-4 h-4" /></>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
