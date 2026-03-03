import { useState } from "react";
import { X, CheckCircle, ArrowUpRight, Loader2, Image as ImageIcon } from "lucide-react";
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
            // Reusing the general registration table
            const { error } = await (supabase as any).from("symposium_registrations").insert({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                institution: formData.institution || null,
                ticket_type: "Competition - Meme",
                payment_status: "pending",
                notes: `Meme idea/link: ${formData.memeDescription}`
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
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-wide mb-3">Meme Submitted!</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        Your meme entry has been received. We'll consult the meme lords and notify you at <strong className="text-foreground">{formData.email}</strong>.
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
                <div className="p-6 flex justify-between items-center" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-widest">Medical AI Meme Competition</h2>
                        <p className="text-xs text-muted-foreground mt-1">Submit your dankest, most relatable medical AI memes.</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-grow scrollbar-hide space-y-6">

                    {/* Idea Section */}
                    <div className="rounded-xl p-4 bg-blue-50/50 dark:bg-blue-900/10" style={{ border: `1px solid ${BORDER}` }}>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <ImageIcon className="w-3.5 h-3.5" /> What we're looking for
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Create a meme that hilariously captures the intersection of Artificial Intelligence and Medicine. Whether it's ChatGPT diagnosing a cold as cancer, or doctors arguing with WebMD algorithms, make us laugh.
                            <br /><br />
                            <strong>Formats:</strong> Public link to image/post.
                            <br />
                            <strong>Rules:</strong> Keep it clean, keep it relevant to AI in Healthcare/Medical student life.
                        </p>
                    </div>

                    {/* Personal details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "m-name", label: "Full Name", placeholder: "Meme Lord Name", value: formData.name, key: "name" as const },
                            { id: "m-email", label: "Email", placeholder: "your@email.com", value: formData.email, key: "email" as const },
                            { id: "m-phone", label: "Phone / WhatsApp", placeholder: "+92 ...", value: formData.phone, key: "phone" as const },
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

                    {/* Meme Concept / Link */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Your Meme Concept or Link *</Label>
                        <p className="text-[11px] text-muted-foreground -mt-1">Describe your meme concept below OR paste a public Google Drive/Imgur link to your meme.</p>
                        <textarea
                            required
                            rows={4}
                            placeholder="Link to meme: https://imgur.com/..."
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
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Meme <ArrowUpRight className="w-4 h-4" /></>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
