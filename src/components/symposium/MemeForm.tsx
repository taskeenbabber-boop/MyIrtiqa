import { useState } from "react";
import { X, CheckCircle, ArrowUpRight, Loader2, Instagram, Mail, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#3b82f6";
const SURFACE = "hsl(var(--card))";
const BORDER = "hsl(var(--border))";

interface MemeFormProps {
    onClose: () => void;
}

export function MemeForm({ onClose }: MemeFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        institution: "",
        memeDescription: "",
    });

    const canSubmit = formData.name.trim() && formData.email.trim() && formData.phone.trim() && formData.memeDescription.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        try {
            const { error } = await (supabase as any).from("symposium_meme_submissions").insert({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                institution: formData.institution || null,
                meme_url: null,
                description: formData.memeDescription,
                status: "pending",
            });
            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error("Meme submission error:", err);
            alert("Your meme submission has been received! We'll review it shortly.");
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
                    className="w-full max-w-md rounded-3xl p-10 text-center relative z-10 bg-background"
                    style={{ border: `1px solid ${BORDER}` }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(34,197,94,0.1)" }}>
                        <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-wide mb-3">Registration Received!</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        You're registered for the Meme Competition. Don't forget to post your meme and email it to us! We'll contact you at <strong className="text-foreground">{formData.email}</strong>.
                    </p>
                    <button onClick={onClose} className="text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-full text-white" style={{ background: ACCENT }}>Done</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] rounded-3xl relative bg-background"
                style={{ border: `1px solid ${BORDER}` }}
            >
                {/* Header */}
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-widest">Medical AI Meme Competition</h2>
                        <p className="text-xs text-muted-foreground mt-1">Post your meme, email it to us, and register below!</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/guidelines/Meme_Competition_Guidelines.pdf"
                            download
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-muted"
                            style={{ border: `1px solid ${BORDER}`, color: ACCENT }}
                        >
                            <FileText className="w-4 h-4" /> Download Guidelines
                        </a>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 bg-muted rounded-md"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-grow scrollbar-hide space-y-6">

                    {/* How It Works */}
                    <div className="rounded-xl p-5 bg-gradient-to-br from-pink-500/5 to-purple-500/5" style={{ border: `1px solid ${BORDER}` }}>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: ACCENT }}>
                            How to Participate
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ background: ACCENT, color: '#000' }}>1</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    <strong className="text-foreground">Create your meme</strong> — Make a hilarious meme about AI in Medicine or Medical Student life. Keep it clean and relevant!
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ background: ACCENT, color: '#000' }}>2</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    <strong className="text-foreground">Post on Instagram</strong> — Share your meme as a collaboration post with{" "}
                                    <a href="https://www.instagram.com/irtiqa_research/" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline" style={{ color: ACCENT }}>@irtiqa_research</a>
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ background: ACCENT, color: '#000' }}>3</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    <strong className="text-foreground">Email your meme</strong> — Send the same meme image to{" "}
                                    <a href="mailto:info.irtiqa@gmail.com" className="font-bold hover:underline" style={{ color: ACCENT }}>info.irtiqa@gmail.com</a>
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ background: ACCENT, color: '#000' }}>4</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    <strong className="text-foreground">Register below</strong> — Fill in your details and mention your Instagram post link in the description.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Personal details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "m-name", label: "Full Name *", placeholder: "Your full name", value: formData.name, key: "name" as const },
                            { id: "m-email", label: "Email *", placeholder: "your@email.com", value: formData.email, key: "email" as const },
                            { id: "m-phone", label: "Phone / WhatsApp *", placeholder: "+92 ...", value: formData.phone, key: "phone" as const },
                            { id: "m-inst", label: "Institution", placeholder: "Your institution", value: formData.institution, key: "institution" as const },
                        ].map(f => (
                            <div key={f.id} className="space-y-2">
                                <Label htmlFor={f.id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{f.label}</Label>
                                <Input id={f.id} placeholder={f.placeholder} value={f.value}
                                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                    className="h-11 rounded-xl bg-muted/50 text-foreground placeholder-muted-foreground"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Meme Link / Description */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Instagram Post Link & Description *</Label>
                        <p className="text-[11px] text-muted-foreground">Paste your Instagram collaboration post link and any additional caption or context.</p>
                        <textarea
                            rows={3}
                            placeholder="e.g. https://www.instagram.com/p/... — My meme about AI diagnosing a cold as cancer 😂"
                            value={formData.memeDescription}
                            onChange={e => setFormData({ ...formData, memeDescription: e.target.value })}
                            className="w-full rounded-xl bg-muted/50 text-foreground placeholder-muted-foreground text-sm p-4 resize-none focus:outline-none focus:ring-1"
                            style={{ borderColor: BORDER, border: `1px solid ${BORDER}` } as any}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 flex justify-end" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || submitting}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-full text-white transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: ACCENT }}
                    >
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Register <ArrowUpRight className="w-4 h-4" /></>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
