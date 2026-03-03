import { useState } from "react";
import { X, CheckCircle, Upload, ArrowUpRight, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#3b82f6";
const ACCENT_BG = "rgba(59,130,246,0.08)";
const SURFACE = "#111111";
const BORDER = "#222222";

interface PitchFormProps {
    onClose: () => void;
}

export function PitchForm({ onClose }: PitchFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        institution: "",
        rollNumber: "",
        pitchDescription: "",
        documentFile: null as File | null,
    });

    const canSubmit = formData.name.trim() && formData.email.trim() && formData.phone.trim() && formData.pitchDescription.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            let documentUrl: string | null = null;
            if (formData.documentFile) {
                const ext = formData.documentFile.name.split(".").pop();
                const path = `pitch/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("symposium-uploads")
                    .upload(path, formData.documentFile);
                if (!uploadError) documentUrl = path;
            }

            const { error } = await (supabase as any).from("symposium_pitch_submissions").insert({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                institution: formData.institution || null,
                roll_number: formData.rollNumber || null,
                pitch_description: formData.pitchDescription,
                document_url: documentUrl,
                status: "pending",
            });

            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error("Pitch submission error:", err);
            alert("Your pitch has been submitted! We'll review it shortly.");
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
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-3">Pitch Submitted!</h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-6">
                        We've received your pitch submission. Our team will review it and notify you at <strong className="text-white/60">{formData.email}</strong> about your selection status.
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
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">AI Pitch Competition</h2>
                        <p className="text-xs text-white/30 mt-1">Submit your AI-powered healthcare solution idea</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/guidelines/AI_Pitch_Guidelines.pdf"
                            download
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-white/5"
                            style={{ border: `1px solid ${BORDER}`, color: ACCENT }}
                        >
                            <FileText className="w-4 h-4" /> Download Guidelines
                        </a>
                        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 bg-white/5 rounded-md"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-grow scrollbar-hide space-y-6">
                    {/* Requirements info */}
                    <div className="rounded-xl p-4" style={{ background: ACCENT_BG, border: `1px solid rgba(59,130,246,0.15)` }}>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>What We Need From You</h4>
                        <ul className="text-xs text-white/40 space-y-1.5">
                            <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} /> A clear problem statement in healthcare</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} /> Your proposed AI-based solution</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} /> Feasibility, workflow, and expected impact</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} /> Format: 5 min pitch + 3 min Q&A</li>
                        </ul>
                    </div>

                    {/* Personal details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "p-name", label: "Full Name", placeholder: "Your full name", value: formData.name, key: "name" as const },
                            { id: "p-email", label: "Email", placeholder: "your@email.com", value: formData.email, key: "email" as const },
                            { id: "p-phone", label: "Phone / WhatsApp", placeholder: "+92 ...", value: formData.phone, key: "phone" as const },
                            { id: "p-inst", label: "Institution", placeholder: "Your institution", value: formData.institution, key: "institution" as const },
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

                    {/* Roll number (optional) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-white/30">Roll Number <span className="font-normal">(Optional — for NWSM students)</span></Label>
                        <Input placeholder="e.g. 2024-MBBS-001" value={formData.rollNumber}
                            onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                            className="h-11 rounded-xl text-white placeholder:text-white/20"
                            style={{ background: SURFACE, borderColor: BORDER }}
                        />
                    </div>

                    {/* Pitch description */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Your Pitch Idea *</Label>
                        <p className="text-[11px] text-white/25 -mt-1">Describe the problem you're solving, your AI solution, and its impact on healthcare. Be as detailed as possible — this is what our panel reviews for selection.</p>
                        <textarea
                            required
                            rows={5}
                            placeholder="E.g.: We propose an AI-powered triage assistant that..."
                            value={formData.pitchDescription}
                            onChange={e => setFormData({ ...formData, pitchDescription: e.target.value })}
                            className="w-full rounded-xl text-white placeholder:text-white/15 text-sm p-4 resize-none focus:outline-none focus:ring-1"
                            style={{ background: SURFACE, borderColor: BORDER, border: `1px solid ${BORDER}` } as any}
                        />
                    </div>

                    {/* Document upload */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-white/30">Upload Your Pitch Document <span className="font-normal">(Optional — PDF, DOCX, PPTX)</span></Label>
                        <label
                            htmlFor="pitchDoc"
                            className="flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer group transition-all"
                            style={{ border: `2px dashed ${BORDER}`, background: SURFACE }}
                        >
                            <FileText className="w-6 h-6 mb-2" style={{ color: "#444" }} />
                            <p className="text-sm text-white/30 group-hover:text-white/60 transition-colors">
                                <span style={{ color: ACCENT }} className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-white/20 mt-1">PDF, DOCX, PPTX (MAX 10MB)</p>
                            <input id="pitchDoc" type="file" className="hidden"
                                accept=".pdf,.docx,.doc,.pptx,.ppt"
                                onChange={e => setFormData({ ...formData, documentFile: e.target.files?.[0] || null })}
                            />
                        </label>
                        {formData.documentFile && (
                            <div className="flex items-center gap-2 text-xs text-white/40 mt-2">
                                <CheckCircle className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                                <span>{formData.documentFile.name}</span>
                            </div>
                        )}
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
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Pitch <ArrowUpRight className="w-4 h-4" /></>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
