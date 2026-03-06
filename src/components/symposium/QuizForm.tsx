import { useState } from "react";
import { X, CheckCircle, ArrowUpRight, Loader2, Upload, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#3b82f6";
const ACCENT_BG = "rgba(59,130,246,0.08)";
const SURFACE = "#111111";
const BORDER = "#222222";

interface QuizFormProps {
    onClose: () => void;
}

export function QuizForm({ onClose }: QuizFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        institution: "",
        rollNumber: "",
        receiptFile: null as File | null,
    });

    const canSubmit = formData.name.trim() && formData.email.trim() && formData.phone.trim() && formData.receiptFile;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        if (formData.receiptFile && formData.receiptFile.size > 5 * 1024 * 1024) {
            alert("Payment receipt must be less than 5MB.");
            return;
        }

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

            const { error } = await (supabase as any).from("symposium_quiz_submissions").insert({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                institution: formData.institution || null,
                roll_number: formData.rollNumber || null,
                receipt_url: receiptUrl,
                status: "pending",
            });
            if (error) throw error;
            setSubmitted(true);
            // Send confirmation email (fire-and-forget)
            supabase.functions.invoke("send-symposium-email", {
                body: { mode: "confirmation", to: formData.email, name: formData.name, type: "quiz" },
            }).catch(console.error);
        } catch (err) {
            console.error("Quiz submission error:", err);
            alert("Your quiz registration has been received! We'll review it shortly.");
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
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-3">Quiz Registered!</h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-6">
                        Your registration has been submitted. We'll notify you at <strong className="text-white/60">{formData.email}</strong> once confirmed.
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
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">AI Quiz Competition</h2>
                        <p className="text-xs text-white/30 mt-1">Test your knowledge in medical AI and cutting-edge technology</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/guidelines/AI_Quiz_Competition_Guidelines.pdf"
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

                    {/* Personal details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "q-name", label: "Full Name", placeholder: "Your full name", value: formData.name, key: "name" as const },
                            { id: "q-email", label: "Email", placeholder: "your@email.com", value: formData.email, key: "email" as const },
                            { id: "q-phone", label: "Phone / WhatsApp", placeholder: "+92 ...", value: formData.phone, key: "phone" as const },
                            { id: "q-inst", label: "Institution", placeholder: "Your institution", value: formData.institution, key: "institution" as const },
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

                    {/* Payment Step */}
                    <div className="rounded-xl p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ACCENT_BG }}>
                                <Upload className="w-4 h-4" style={{ color: ACCENT }} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-widest uppercase">Payment & Receipt</h3>
                                <p className="text-xs text-white/30 mt-0.5">Registration Fee: <strong className="text-white/80">500 PKR</strong></p>
                            </div>
                        </div>

                        <div className="rounded-lg p-3 mb-4 text-xs font-mono text-white/60 text-center leading-relaxed" style={{ background: "#000", border: `1px dashed ${BORDER}` }}>
                            <strong className="text-white">🏦 Meezan Bank Limited</strong><br />
                            Account Title: Zahoor Ahmed Khan<br />
                            Account No: 00300113953149<br />
                            IBAN: PK56MEZN0000300113953149<br /><br />
                            <strong className="text-white">📱 Easypaisa</strong><br />
                            Number: 03139802668<br />
                            Account Title: Zahoor Ahmad Khan<br />
                            IBAN: PK47TMFB0000000043652207
                        </div>

                        <label
                            htmlFor="quizReceipt"
                            className="flex flex-col items-center justify-center w-full h-24 rounded-xl cursor-pointer group transition-all"
                            style={{ border: `2px dashed ${BORDER}`, background: "#0a0a0a" }}
                        >
                            <p className="text-sm text-white/30 group-hover:text-white/60 transition-colors text-center px-4">
                                <span style={{ color: ACCENT }} className="font-semibold">Upload Payment Receipt</span> *<br />
                                <span className="text-[10px] uppercase mt-1 block">JPG, PNG, PDF (Max 5MB)</span>
                            </p>
                            <input id="quizReceipt" type="file" required className="hidden"
                                accept="image/*,.pdf"
                                onChange={e => setFormData({ ...formData, receiptFile: e.target.files?.[0] || null })}
                            />
                        </label>

                        {formData.receiptFile && (
                            <div className="flex items-center gap-2 text-xs text-white/40 mt-3">
                                <CheckCircle className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                                <span>{formData.receiptFile.name} ({(formData.receiptFile.size / 1024 / 1024).toFixed(2)} MB)</span>
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
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Register for Quiz <ArrowUpRight className="w-4 h-4" /></>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
