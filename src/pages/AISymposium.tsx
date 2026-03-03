import { useState, useEffect, useRef } from "react";
import { X, MapPin, Clock, ArrowUpRight, ChevronRight, ChevronDown, Zap, Calendar, Users, Award, Navigation, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { RegistrationForm } from "@/components/symposium/RegistrationForm";
import { PitchForm } from "@/components/symposium/PitchForm";
import { PosterForm } from "@/components/symposium/PosterForm";
import { MemeForm } from "@/components/symposium/MemeForm";
import aiIconLogo from "@/assets/AI-icon.png";

/* ——— accent tokens ——— */
const ACCENT = "#3b82f6";       // vibrant blue
const ACCENT_LIGHT = "#60a5fa"; // lighter blue
const ACCENT_BG = "rgba(59,130,246,0.08)";
/* Theme-aware surface tokens — use CSS variables from the design system */
const SURFACE = "hsl(var(--card))";
const SURFACE_2 = "hsl(var(--muted))";
const BORDER = "hsl(var(--border))";

/* ——— event data ——— */
const SYMPOSIUM_EVENTS = [
    {
        id: "ws-1", category: "Workshop", title: "AI for Note Taking",
        speaker: "Haroon", speakerRole: "AI Specialist",
        speakerImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
        location: "Workshop Room 1", time: "10:00 AM – 12:00 PM", date: "10 Apr 2026",
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600",
        description: "Learn how to leverage AI tools for efficient medical and academic note-taking. This workshop covers structure, synthesis, and retrieval of complex clinical information using cutting-edge NLP models.",
        fee: "Students: 500 PKR | Faculty/Doctors: 1000 PKR", capacity: "45 Seats"
    },
    {
        id: "ws-2", category: "Workshop", title: "Prompt Engineering & AI in Design",
        speaker: "Mr. Asad", speakerRole: "Design Lead",
        speakerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        location: "Workshop Room 2", time: "10:00 AM – 12:00 PM", date: "10 Apr 2026",
        image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=600",
        description: "Master the art of prompt engineering for both text and visual generation. Essential for structuring research queries and creating academic/medical design materials securely.",
        fee: "Students: 500 PKR | Faculty/Doctors: 1000 PKR", capacity: "50 Seats"
    },
    {
        id: "ws-3", category: "Workshop", title: "AI in Research",
        speaker: "Iftikhar", speakerRole: "Research Fellow",
        speakerImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
        location: "Workshop Room 1", time: "2:00 PM – 4:00 PM", date: "10 Apr 2026",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600",
        description: "A comprehensive guide to utilizing AI in literature review, data synthesis, and manuscript structuring while maintaining absolute academic integrity and bias awareness.",
        fee: "Students: 500 PKR | Faculty/Doctors: 1000 PKR", capacity: "40 Seats"
    },
    {
        id: "ws-4", category: "Workshop", title: "Clinical Audit & AI in Clinical Use",
        speaker: "Dr. Almas Fasih Khattak", speakerRole: "Clinical Director",
        speakerImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150",
        location: "Workshop Room 2", time: "2:00 PM – 4:00 PM", date: "10 Apr 2026",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600",
        description: "Exploring the practical application of AI in clinical settings. Covering diagnostic support algorithms, patient data auditing, and the integration of AI models in secure hospital workflows.",
        fee: "Students: 500 PKR | Faculty/Doctors: 1000 PKR", capacity: "60 Seats"
    },
    {
        id: "kn-1", category: "Keynote", title: "AI and the Future of Global Surgery",
        speaker: "Keynote Speaker", speakerRole: "Global Health Expert",
        speakerImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=150",
        location: "Main Auditorium", time: "Morning Session", date: "11 Apr 2026",
        image: "https://images.unsplash.com/photo-1551076805-e1869043e560?auto=format&fit=crop&q=80&w=600",
        description: "How AI supports surgical planning and intra-operative decisions. Role of AI in training and simulation. Use of AI tools in low-resource settings. How AI may reduce global surgical inequalities.",
        fee: "Included in Conference Pass", capacity: "500+ Seats"
    },
    {
        id: "kn-2", category: "Keynote", title: "Thinking Like a Builder: AI Solutions in Healthcare",
        speaker: "Keynote Speaker", speakerRole: "MedTech Innovator",
        speakerImage: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150",
        location: "Main Auditorium", time: "Midday Session", date: "11 Apr 2026",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
        description: "How students can identify real problems in healthcare and turn them into AI-based ideas. Introduction to builder mindset: Iterate, test, improve. Simple prototyping approaches.",
        fee: "Included in Conference Pass", capacity: "500+ Seats"
    },
    {
        id: "pn-1", category: "Panel", title: "Human Expertise vs AI Systems",
        speaker: "Expert Panelists", speakerRole: "Cross-disciplinary Board",
        speakerImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=150",
        location: "Main Auditorium", time: "60 Minutes", date: "11 Apr 2026",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600",
        description: "A deep dive into where AI excels and where humans remain essential. Panelists will share insights on AI in diagnostics, its limits in reasoning and empathy, patient safety, and accountability.",
        fee: "Included in Conference Pass", capacity: "500+ Seats"
    },
    {
        id: "cmp-1", category: "Competition", title: "AI Poster Competition",
        speaker: "Individual Participants", speakerRole: "Researchers",
        speakerImage: "https://images.unsplash.com/photo-1587614295999-6c1c13675117?auto=format&fit=crop&q=80&w=150",
        location: "Exhibition Hall", time: "TBA", date: "11 Apr 2026",
        image: "https://images.unsplash.com/photo-1587614295999-6c1c13675117?auto=format&fit=crop&q=80&w=600",
        description: "Individual poster presentation with a live demonstration of a chosen AI tool. Covers background, medical applications, ethical concerns, and future possibilities.",
        fee: "Included in Conference Pass", capacity: "Variable"
    },
    {
        id: "cmp-2", category: "Competition", title: "AI Drill",
        speaker: "Participants", speakerRole: "Problem Solvers",
        speakerImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=150",
        location: "Computer Lab", time: "1 Hour", date: "11 Apr 2026",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
        description: "Fast, structured problem-solving challenge. Participants receive a medical case or research problem and have one hour to work through it using AI tools.",
        fee: "Included in Conference Pass", capacity: "Variable"
    },
    {
        id: "cmp-3", category: "Competition", title: "AI Debate",
        speaker: "Debaters", speakerRole: "Orators",
        speakerImage: "https://images.unsplash.com/photo-1475721025505-11900531505c?auto=format&fit=crop&q=80&w=150",
        location: "Debate Hall", time: "TBA", date: "11 Apr 2026",
        image: "https://images.unsplash.com/photo-1475721025505-11900531505c?auto=format&fit=crop&q=80&w=600",
        description: "Two-sided debate on motions like AI in clinical decisions, privacy threats, or role replacement. Judges evaluate structured reasoning and grounded understanding of healthcare AI.",
        fee: "Included in Conference Pass", capacity: "Structured Bracket"
    },
    {
        id: "cmp-4", category: "Competition", title: "AI Pitch Competition",
        speaker: "Innovators", speakerRole: "Entrepreneurs",
        speakerImage: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=150",
        location: "Pitch Room", time: "5m Pitch + 3m Q&A", date: "11 Apr 2026",
        image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=600",
        description: "Propose original AI-based solutions to a medical/research problem. Must include problem statement, AI solution, feasibility, workflow, and impact.",
        fee: "Included in Conference Pass", capacity: "Limited Slots"
    }
];

const CATEGORIES = ["All", "Workshop", "Keynote", "Panel", "Competition"];

const STATS = [
    { value: "11+", label: "Sessions & Events" },
    { value: "4", label: "Hands-on Workshops" },
    { value: "2", label: "Days of Innovation" },
    { value: "500+", label: "Expected Delegates" },
];

const MARQUEE_ITEMS = ["Artificial Intelligence", "Neurosurgery", "Clinical Diagnostics", "Prompt Engineering", "Research Innovation", "Global Surgery", "Healthcare AI"];

/* ————————————————————————————————————————————— */
const AISymposium = () => {
    const [filter, setFilter] = useState("All");
    const [selectedEvent, setSelectedEvent] = useState<typeof SYMPOSIUM_EVENTS[0] | null>(null);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isPitchFormOpen, setIsPitchFormOpen] = useState(false);
    const [isPosterFormOpen, setIsPosterFormOpen] = useState(false);
    const [isMemeFormOpen, setIsMemeFormOpen] = useState(false);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const filteredEvents = SYMPOSIUM_EVENTS.filter(ev =>
        filter === "All" || ev.category === filter
    );

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ═══════════════ HERO ═══════════════ */}
            <header ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-[#0a0a0a] dark:via-[#0a0a0a] dark:to-[#0a0a0a]">
                {/* Grid background */}
                <div className="absolute inset-0 z-0" style={{
                    backgroundImage: 'linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    backgroundPosition: 'center center',
                }} />
                <div className="dark:hidden absolute inset-0 z-0" style={{
                    backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                }} />

                {/* Ambient radial glow */}
                <div className="absolute z-0" style={{
                    width: '70vw', height: '70vw',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    animation: 'pulseAmbient 8s infinite alternate ease-in-out',
                }} />

                {/* Pink secondary glow */}
                <div className="absolute z-0" style={{
                    width: '40vw', height: '40vw',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)',
                    top: '40%', left: '55%',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                }} />

                {/* Content stack */}
                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="relative z-10 flex flex-col items-center text-center px-6"
                >
                    {/* Top badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-6"
                    >
                        <span
                            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[5px] uppercase px-5 py-2.5 rounded-full border"
                            style={{ color: ACCENT, borderColor: 'rgba(59,130,246,0.3)', background: ACCENT_BG }}
                        >
                            <Zap className="w-3 h-3" /> NWSM × GSRH
                        </span>
                    </motion.div>

                    {/* Floating AI Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3, type: 'spring', damping: 15 }}
                        className="mb-4"
                        style={{ perspective: '1000px' }}
                    >
                        <img
                            src={aiIconLogo}
                            alt="AI Symposium"
                            className="w-[220px] md:w-[280px] h-auto"
                            style={{
                                animation: 'cinematicFloat 6s ease-in-out infinite',
                                willChange: 'transform, filter',
                            }}
                        />
                    </motion.div>

                    {/* Kinetic typography container */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="relative w-full flex justify-center items-start"
                        style={{ height: '160px' }}
                    >
                        {/* Frame 1: SYMPOSIUM 2026 */}
                        <div
                            className="absolute flex flex-col items-center text-center"
                            style={{ animation: 'kineticLoop1 8s infinite cubic-bezier(0.25, 1, 0.5, 1)', willChange: 'transform, opacity, filter' }}
                        >
                            <div className="text-sm md:text-xl font-medium tracking-[6px] uppercase text-gray-800 dark:text-white mb-1">
                                SYMPOSIUM
                            </div>
                            <div
                                className="font-black leading-none"
                                style={{
                                    fontSize: 'clamp(4rem, 12vw, 7rem)',
                                    background: 'linear-gradient(to bottom, #1e3a5f, #3b82f6)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: 'drop-shadow(0 5px 15px rgba(59,130,246,0.3))',
                                }}
                            >
                                2026
                            </div>
                        </div>

                        {/* Frame 2: #Code SeCure */}
                        <div
                            className="absolute flex flex-col items-center text-center"
                            style={{ animation: 'kineticLoop2 8s infinite cubic-bezier(0.25, 1, 0.5, 1)', willChange: 'transform, opacity, filter' }}
                        >
                            <div className="font-semibold text-gray-900 dark:text-white leading-tight" style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', letterSpacing: '-2px' }}>
                                #Code
                            </div>
                            <div className="flex items-center justify-center">
                                <span
                                    className="font-extrabold leading-none"
                                    style={{
                                        fontSize: 'clamp(2.5rem, 7vw, 4rem)',
                                        background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        letterSpacing: '-3px',
                                    }}
                                >
                                    Se
                                </span>
                                <span className="font-extrabold text-gray-900 dark:text-white leading-none" style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', letterSpacing: '-3px' }}>
                                    Cure
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.9 }}
                        className="max-w-xl text-gray-500 dark:text-white/40 text-sm md:text-base leading-relaxed mb-10 mt-2"
                    >
                        A two-day exploration at the intersection of AI, neurosurgery, and clinical diagnostics — where breakthrough meets bedside. April 2026, NWSM Peshawar.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 1.1 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <button
                            onClick={() => setIsRegistrationOpen(true)}
                            className="group flex items-center gap-3 text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]"
                            style={{ background: ACCENT }}
                        >
                            Register Now
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={() => document.getElementById("agenda")?.scrollIntoView({ behavior: "smooth" })}
                            className="group flex items-center gap-3 text-gray-700 dark:text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full border transition-all duration-300 hover:bg-blue-50 dark:hover:bg-white/5"
                            style={{ borderColor: 'hsl(var(--border))' }}
                        >
                            Explore Agenda
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-5 h-8 rounded-full border-2 flex justify-center pt-1.5"
                        style={{ borderColor: 'hsl(var(--border))' }}
                    >
                        <motion.div className="w-1 h-1.5 rounded-full" style={{ background: ACCENT }} />
                    </motion.div>
                </motion.div>

                {/* ═══ FLOATING GLASS CARDS (desktop only) ═══ */}
                <div className="hidden lg:block absolute inset-0 z-[5] pointer-events-none">

                    {/* ——— LEFT SIDE CARDS ——— */}

                    {/* Card L1: Event Date */}
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 1.4 }}
                        className="absolute"
                        style={{ top: '18%', left: '4%', animation: 'glassFloat1 7s ease-in-out infinite' }}
                    >
                        <div className="rounded-2xl border border-blue-100 dark:border-white/10 p-5 w-[220px] bg-white/95 dark:bg-slate-900/60 shadow-lg shadow-blue-100/50 dark:shadow-none" style={{ backdropFilter: 'blur(20px)' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase text-blue-400">Event Date</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">Apr 10–11</div>
                            <div className="text-xs text-gray-400 dark:text-white/30">2026 • Two Days</div>
                            <div className="mt-3 flex gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <span className="w-2 h-2 rounded-full bg-blue-400/40" />
                                <span className="w-2 h-2 rounded-full bg-blue-400/20" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card L2: Submission Deadline */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 1.7 }}
                        className="absolute"
                        style={{ top: '45%', left: '2%', animation: 'glassFloat2 8s ease-in-out infinite' }}
                    >
                        <div className="rounded-2xl border border-blue-100 dark:border-white/10 p-5 w-[210px] bg-white/95 dark:bg-slate-900/60 shadow-lg shadow-blue-100/50 dark:shadow-none" style={{ backdropFilter: 'blur(20px)' }}>
                            <div className="text-[10px] font-bold tracking-widest uppercase text-purple-400 mb-2">⏰ Deadlines</div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 rounded-full bg-purple-500" />
                                    <div>
                                        <div className="text-xs font-semibold text-gray-800 dark:text-white">Poster Submission</div>
                                        <div className="text-[10px] text-gray-400 dark:text-white/30">Mar 25, 2026</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 rounded-full bg-blue-500" />
                                    <div>
                                        <div className="text-xs font-semibold text-gray-800 dark:text-white">Pitch Abstract</div>
                                        <div className="text-[10px] text-gray-400 dark:text-white/30">Mar 30, 2026</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 rounded-full bg-cyan-500" />
                                    <div>
                                        <div className="text-xs font-semibold text-gray-800 dark:text-white">Registration</div>
                                        <div className="text-[10px] text-gray-400 dark:text-white/30">Apr 5, 2026</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card L3: Speakers */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 2.0 }}
                        className="absolute"
                        style={{ top: '74%', left: '5%', animation: 'glassFloat3 6s ease-in-out infinite' }}
                    >
                        <div className="rounded-2xl border border-blue-100 dark:border-white/10 p-4 w-[190px] bg-white/95 dark:bg-slate-900/60 shadow-lg shadow-blue-100/50 dark:shadow-none" style={{ backdropFilter: 'blur(20px)' }}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-[10px] font-bold tracking-widest uppercase text-blue-400">Speakers</div>
                                <Users className="w-3.5 h-3.5 text-blue-400/60" />
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white">12+</div>
                            <div className="text-[10px] text-gray-400 dark:text-white/30 mt-1">Expert Panelists & Judges</div>
                            <div className="mt-2 h-1 rounded-full bg-gray-200 dark:bg-white/5 overflow-hidden">
                                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                            </div>
                        </div>
                    </motion.div>

                    {/* ——— RIGHT SIDE CARDS ——— */}

                    {/* Card R1: Venue */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 1.5 }}
                        className="absolute"
                        style={{ top: '16%', right: '4%', animation: 'glassFloat2 7.5s ease-in-out infinite' }}
                    >
                        <div className="rounded-2xl border border-blue-100 dark:border-white/10 p-5 w-[220px] bg-white/95 dark:bg-slate-900/60 shadow-lg shadow-blue-100/50 dark:shadow-none" style={{ backdropFilter: 'blur(20px)' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                                    <Navigation className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Venue</div>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">NWSM Peshawar</div>
                            <div className="text-[10px] text-gray-400 dark:text-white/30 leading-relaxed">Northwest School of Medicine & Gandhara University</div>
                        </div>
                    </motion.div>

                    {/* Card R2: Keynote Topics */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 1.8 }}
                        className="absolute"
                        style={{ top: '44%', right: '2%', animation: 'glassFloat1 8.5s ease-in-out infinite' }}
                    >
                        <div className="rounded-2xl border border-blue-100 dark:border-white/10 p-5 w-[210px] bg-white/95 dark:bg-slate-900/60 shadow-lg shadow-blue-100/50 dark:shadow-none" style={{ backdropFilter: 'blur(20px)' }}>
                            <div className="text-[10px] font-bold tracking-widest uppercase text-pink-400 mb-3">🧠 Key Tracks</div>
                            <div className="space-y-2">
                                {['Neurosurgery & AI', 'Prompt Engineering', 'Clinical Diagnostics', 'AI in Research'].map((topic, i) => (
                                    <div key={topic} className="flex items-center gap-2 text-xs">
                                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                                            style={{ background: `hsl(${220 + i * 30}, 80%, 60%, 0.15)`, color: `hsl(${220 + i * 30}, 80%, 65%)` }}>
                                            {i + 1}
                                        </div>
                                        <span className="text-gray-600 dark:text-white/70">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Card R3: Live Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 2.1 }}
                        className="absolute"
                        style={{ top: '74%', right: '5%', animation: 'glassFloat3 7s ease-in-out infinite' }}
                    >
                        <div className="rounded-2xl border border-blue-100 dark:border-white/10 p-4 w-[190px] bg-white/95 dark:bg-slate-900/60 shadow-lg shadow-blue-100/50 dark:shadow-none" style={{ backdropFilter: 'blur(20px)' }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Live</div>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[9px] text-emerald-400/70">Active</span>
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">6</div>
                                    <div className="text-[9px] text-gray-400 dark:text-white/30">Workshops</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">3</div>
                                    <div className="text-[9px] text-gray-400 dark:text-white/30">Keynotes</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">2</div>
                                    <div className="text-[9px] text-gray-400 dark:text-white/30">Competitions</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">4</div>
                                    <div className="text-[9px] text-gray-400 dark:text-white/30">Panels</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* CSS Keyframes (injected via style tag) */}
                <style>{`
                    @keyframes cinematicFloat {
                        0% { transform: translateY(0px) rotateX(2deg) rotateY(-2deg); filter: drop-shadow(0 10px 20px rgba(236,72,153,0.4)); }
                        50% { transform: translateY(-15px) rotateX(-2deg) rotateY(2deg) scale(1.02); filter: drop-shadow(0 25px 35px rgba(59,130,246,0.6)); }
                        100% { transform: translateY(0px) rotateX(2deg) rotateY(-2deg); filter: drop-shadow(0 10px 20px rgba(236,72,153,0.4)); }
                    }
                    @keyframes kineticLoop1 {
                        0%, 42% { opacity: 1; transform: scale(1); filter: blur(0px); }
                        48%, 94% { opacity: 0; transform: scale(1.1); filter: blur(10px); }
                        100% { opacity: 1; transform: scale(1); filter: blur(0px); }
                    }
                    @keyframes kineticLoop2 {
                        0%, 42% { opacity: 0; transform: scale(0.9); filter: blur(10px); }
                        48%, 94% { opacity: 1; transform: scale(1); filter: blur(0px); }
                        100% { opacity: 0; transform: scale(0.9); filter: blur(10px); }
                    }
                    @keyframes pulseAmbient {
                        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
                        100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                    }
                    @keyframes glassFloat1 {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-12px); }
                    }
                    @keyframes glassFloat2 {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-8px) rotate(1deg); }
                    }
                    @keyframes glassFloat3 {
                        0%, 100% { transform: translateY(0px); }
                        33% { transform: translateY(-6px); }
                        66% { transform: translateY(4px); }
                    }
                `}</style>
            </header>

            {/* ═══════════════ MARQUEE BAND ═══════════════ */}
            <div className="border-y overflow-hidden py-5" style={{ borderColor: BORDER }}>
                <motion.div
                    animate={{ x: [0, -1400] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="flex gap-12 whitespace-nowrap"
                >
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                        <span key={i} className="flex items-center gap-4 text-xl md:text-2xl font-bold uppercase tracking-wider">
                            <span className="text-gray-400 dark:text-white/30">{item}</span>
                            <span className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* ═══════════════ WHY ATTEND / STATS ═══════════════ */}
            <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-1/3">
                        <p className="text-xs font-semibold tracking-[4px] uppercase mb-4" style={{ color: ACCENT }}>
                            Why Attend
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight mb-6">
                            Your Gateway to<br />
                            <span style={{ color: ACCENT }}>AI in Medicine</span>
                        </h2>
                        <p className="text-gray-500 dark:text-white/40 leading-relaxed">
                            Expert-led workshops, inspiring keynotes, and competitive tracks designed to transform how you think about artificial intelligence in healthcare.
                        </p>
                    </div>
                    <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {STATS.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl border text-center"
                                style={{ background: SURFACE, borderColor: BORDER }}
                            >
                                <div className="text-4xl font-black mb-2" style={{ color: ACCENT }}>{s.value}</div>
                                <div className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider font-medium">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ EVENT SCHEDULE TIMELINE ═══════════════ */}
            <section id="schedule" className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
                {/* Section heading + toggle */}
                <div className="text-center mb-10">
                    <p className="text-xs font-semibold tracking-[4px] uppercase mb-4" style={{ color: ACCENT }}>
                        Schedule
                    </p>
                    <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight">
                        Event at a <span style={{ color: ACCENT }}>Glance</span>
                    </h2>
                    <p className="text-gray-500 dark:text-white/30 mt-4 max-w-lg mx-auto">
                        Two days of workshops, keynotes, panel discussions, and competitions — here's how it all unfolds.
                    </p>
                    <button
                        onClick={() => setScheduleOpen(!scheduleOpen)}
                        className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-8 py-3.5 rounded-full transition-all duration-300 hover:bg-white/5 group"
                        style={{ color: ACCENT, border: `1px solid rgba(59,130,246,0.3)`, background: ACCENT_BG }}
                    >
                        {scheduleOpen ? "Hide Schedule" : "View Full Schedule"}
                        <motion.div animate={{ rotate: scheduleOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                            <ChevronDown className="w-4 h-4" />
                        </motion.div>
                    </button>
                </div>

                {/* Collapsible timeline */}
                <AnimatePresence>
                    {scheduleOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="relative pt-4">
                                {/* Vertical timeline line (desktop) */}
                                <div className="absolute left-[140px] top-0 bottom-0 w-px hidden lg:block" style={{ background: `linear-gradient(to bottom, transparent, ${BORDER} 5%, ${BORDER} 95%, transparent)` }} />

                                <div className="space-y-6 lg:space-y-0">
                                    {/* ——— DAY 1 ——— */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5 }}
                                        className="flex flex-col lg:flex-row gap-6 lg:gap-0 relative pb-8 lg:pb-12"
                                    >
                                        {/* Date block */}
                                        <div className="lg:w-[140px] flex-shrink-0 flex lg:flex-col items-center lg:items-end gap-3 lg:gap-0 lg:pr-8 lg:text-right">
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                                style={{ background: ACCENT, color: "#000" }}
                                            >
                                                Thu
                                            </span>
                                            <div className="text-6xl lg:text-7xl font-black leading-none text-foreground mt-1">10</div>
                                            <div className="text-sm text-gray-400 dark:text-white/30 font-medium">April, 2026</div>
                                        </div>

                                        {/* Timeline dot (desktop) */}
                                        <div className="hidden lg:flex absolute left-[140px] top-4 -translate-x-1/2 items-center justify-center">
                                            <div className="w-4 h-4 rounded-full border-2 relative" style={{ borderColor: ACCENT, background: "#0a0a0a" }}>
                                                <div className="absolute inset-1 rounded-full" style={{ background: ACCENT }} />
                                            </div>
                                        </div>

                                        {/* Events for this day */}
                                        <div className="lg:pl-12 flex-grow space-y-4">
                                            <div className="text-xs font-bold uppercase tracking-[3px] mb-2 text-gray-300 dark:text-white/20">Pre-Conference Day</div>

                                            {/* Morning Block */}
                                            <div className="rounded-2xl p-5 md:p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                                    <h3 className="text-lg font-bold text-foreground">Morning Workshops</h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30">
                                                            <Clock className="w-3 h-3" style={{ color: ACCENT }} />
                                                            <span>10:00 AM – 12:00 PM</span>
                                                        </div>
                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-gray-400 dark:text-white/40" style={{ background: 'hsl(var(--muted) / 0.3)' }}>
                                                            Parallel
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="flex items-start gap-3 p-3.5 rounded-xl transition-colors" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: ACCENT_BG, color: ACCENT }}>
                                                            A
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-foreground">AI for Note Taking</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Workshop Room 1</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5">Haroon — AI Specialist</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3.5 rounded-xl transition-colors" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: ACCENT_BG, color: ACCENT }}>
                                                            B
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-foreground">Prompt Engineering & Design</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Workshop Room 2</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5">Mr. Asad — Design Lead</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Break indicator */}
                                            <div className="flex items-center gap-3 pl-4">
                                                <div className="w-2 h-2 rounded-full" style={{ background: "#333" }} />
                                                <span className="text-xs text-gray-400 dark:text-white/15 uppercase tracking-widest font-medium">12:00 PM – 2:00 PM • Lunch & Networking</span>
                                            </div>

                                            {/* Afternoon Block */}
                                            <div className="rounded-2xl p-5 md:p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                                    <h3 className="text-lg font-bold text-foreground">Afternoon Workshops</h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30">
                                                            <Clock className="w-3 h-3" style={{ color: ACCENT }} />
                                                            <span>2:00 PM – 4:00 PM</span>
                                                        </div>
                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-gray-400 dark:text-white/40" style={{ background: 'hsl(var(--muted) / 0.3)' }}>
                                                            Parallel
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: ACCENT_BG, color: ACCENT }}>
                                                            C
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-foreground">AI in Research</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Workshop Room 1</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5">Iftikhar — Research Fellow</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: ACCENT_BG, color: ACCENT }}>
                                                            D
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-foreground">Clinical Audit & AI in Clinical Use</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Workshop Room 2</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5">Dr. Almas Fasih Khattak</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Day separator */}
                                    <div className="hidden lg:block h-6" />

                                    {/* ——— DAY 2 ——— */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="flex flex-col lg:flex-row gap-6 lg:gap-0 relative"
                                    >
                                        {/* Date block */}
                                        <div className="lg:w-[140px] flex-shrink-0 flex lg:flex-col items-center lg:items-end gap-3 lg:gap-0 lg:pr-8 lg:text-right">
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                                style={{ background: ACCENT, color: "#000" }}
                                            >
                                                Fri
                                            </span>
                                            <div className="text-6xl lg:text-7xl font-black leading-none text-foreground mt-1">11</div>
                                            <div className="text-sm text-gray-400 dark:text-white/30 font-medium">April, 2026</div>
                                        </div>

                                        {/* Timeline dot (desktop) */}
                                        <div className="hidden lg:flex absolute left-[140px] top-4 -translate-x-1/2 items-center justify-center">
                                            <div className="w-4 h-4 rounded-full border-2 relative" style={{ borderColor: ACCENT, background: "#0a0a0a" }}>
                                                <div className="absolute inset-1 rounded-full" style={{ background: ACCENT }} />
                                            </div>
                                        </div>

                                        {/* Events for this day */}
                                        <div className="lg:pl-12 flex-grow space-y-4">
                                            <div className="text-xs font-bold uppercase tracking-[3px] mb-2 text-gray-300 dark:text-white/20">Main Conference Day</div>

                                            {/* Keynotes */}
                                            <div className="rounded-2xl p-5 md:p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(251,191,36,0.1)" }}>
                                                        <Award className="w-4 h-4 text-amber-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-foreground">Keynote Addresses</h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30">
                                                        <Clock className="w-3 h-3" style={{ color: ACCENT }} />
                                                        <span>Morning – Midday</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-4 p-3.5 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: ACCENT }} />
                                                        <div>
                                                            <div className="text-sm font-semibold text-foreground">AI and the Future of Global Surgery</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5">Keynote Speaker • Main Auditorium • Morning Session</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 p-3.5 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: ACCENT }} />
                                                        <div>
                                                            <div className="text-sm font-semibold text-foreground">Thinking Like a Builder: AI Solutions in Healthcare</div>
                                                            <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5">Keynote Speaker • Main Auditorium • Midday Session</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Panel Discussion */}
                                            <div className="rounded-2xl p-5 md:p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)" }}>
                                                        <Users className="w-4 h-4 text-purple-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-foreground">Panel Discussion</h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30">
                                                        <Clock className="w-3 h-3" style={{ color: ACCENT }} />
                                                        <span>60 Minutes</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-3.5 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                    <div className="w-1 h-10 rounded-full flex-shrink-0 bg-purple-500" />
                                                    <div>
                                                        <div className="text-sm font-semibold text-foreground">Human Expertise vs AI Systems: Competition or Collaboration?</div>
                                                        <div className="text-xs text-gray-400 dark:text-white/25 mt-0.5">Expert Panelists • Main Auditorium</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Competitions */}
                                            <div className="rounded-2xl p-5 md:p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)" }}>
                                                        <Zap className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-foreground">Competitions</h3>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {/* AI Pitch Competition */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                        <div className="flex items-start sm:items-center gap-3">
                                                            <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                                                                1
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-foreground">AI Pitch Competition</div>
                                                                <div className="text-[11px] text-gray-400 dark:text-white/40 mt-0.5">Pitch Room • 5m Pitch + 3m Q&A</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto ml-11 sm:ml-0">
                                                            <a href="/guidelines/AI_Pitch_Guidelines.pdf" download className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg text-xs font-semibold text-foreground transition-colors hover:bg-muted" style={{ border: `1px solid ${BORDER}` }}>
                                                                Guidelines
                                                            </a>
                                                            <button onClick={() => setIsPitchFormOpen(true)} className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: ACCENT }}>
                                                                Apply
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* AI Poster Competition */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                        <div className="flex items-start sm:items-center gap-3">
                                                            <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                                                                2
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-foreground">AI Poster Competition</div>
                                                                <div className="text-[11px] text-gray-400 dark:text-white/40 mt-0.5">Exhibition Hall • Live Demo</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto ml-11 sm:ml-0">
                                                            <a href="/guidelines/AI_Poster_Competition_Guidelines.pdf" download className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg text-xs font-semibold text-foreground transition-colors hover:bg-muted" style={{ border: `1px solid ${BORDER}` }}>
                                                                Guidelines
                                                            </a>
                                                            <button onClick={() => setIsPosterFormOpen(true)} className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: ACCENT }}>
                                                                Apply
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* AI Meme Competition */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                        <div className="flex items-start sm:items-center gap-3">
                                                            <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                                                                3
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-foreground">AI Meme Competition</div>
                                                                <div className="text-[11px] text-gray-400 dark:text-white/40 mt-0.5">Online Submission • Viral Hits</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto ml-11 sm:ml-0">
                                                            <a href="/guidelines/Meme_Competition_Guidelines.pdf" download className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg text-xs font-semibold text-foreground transition-colors hover:bg-muted" style={{ border: `1px solid ${BORDER}` }}>
                                                                Guidelines
                                                            </a>
                                                            <button onClick={() => setIsMemeFormOpen(true)} className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: ACCENT }}>
                                                                Apply
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* AI Drill & Debate (No guidelines/forms yet just info) */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                                                                4
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-foreground">AI Drill</div>
                                                                <div className="text-[11px] text-gray-400 dark:text-white/40">Computer Lab • 1 Hour</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)', border: `1px solid ${BORDER}` }}>
                                                            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                                                                5
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-foreground">AI Debate</div>
                                                                <div className="text-[11px] text-gray-400 dark:text-white/40">Debate Hall • TBA</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* ═══════════════ AGENDA ═══════════════ */}
            <section id="agenda" className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
                {/* Section heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <p className="text-xs font-semibold tracking-[4px] uppercase mb-4" style={{ color: ACCENT }}>
                            Full Programme
                        </p>
                        <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight">
                            Event<br /><span style={{ color: ACCENT }}>Agenda</span>
                        </h2>
                    </div>
                    {/* Filter pills */}
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className="px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-300"
                                style={{
                                    background: filter === cat ? ACCENT : "transparent",
                                    color: filter === cat ? "#000" : "hsl(var(--muted-foreground))",
                                    border: filter === cat ? "none" : `1px solid ${BORDER}`,
                                }}
                            >
                                {cat === "All" ? "All" : cat + "s"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Event list — numbered accordion style */}
                <div className="space-y-3">
                    {filteredEvents.map((ev, idx) => (
                        <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedEvent(ev)}
                            className="group flex items-center gap-6 p-5 md:p-6 rounded-2xl border cursor-pointer transition-all duration-300 hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/5"
                            style={{ background: SURFACE, borderColor: BORDER }}
                        >
                            {/* Number */}
                            <div
                                className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl text-sm font-bold flex-shrink-0"
                                style={{ background: ACCENT_BG, color: ACCENT }}
                            >
                                {String(idx + 1).padStart(2, "0")}
                            </div>

                            {/* Image thumb */}
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                    src={ev.image}
                                    alt={ev.title}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                        style={{ background: ACCENT_BG, color: ACCENT }}
                                    >
                                        {ev.category}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{ev.date}</span>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-foreground truncate group-hover:text-[#3b82f6] transition-colors">
                                    {ev.title}
                                </h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {ev.time}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {ev.location}
                                    </span>
                                </div>
                            </div>

                            {/* Speaker + Arrow */}
                            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <img src={ev.speakerImage} alt={ev.speaker} className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: BORDER }} />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{ev.speaker}</p>
                                        <p className="text-xs text-muted-foreground">{ev.speakerRole}</p>
                                    </div>
                                </div>
                                <div
                                    className="w-10 h-10 rounded-full border flex items-center justify-center group-hover:bg-[#3b82f6] group-hover:border-[#3b82f6] group-hover:text-black transition-all duration-300"
                                    style={{ borderColor: "#333", color: "#666" }}
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="py-24 text-center">
                        <p className="text-xl font-bold text-muted-foreground uppercase tracking-widest">No Events in This Track</p>
                    </div>
                )}
            </section>

            {/* ═══════════════ SECOND MARQUEE ═══════════════ */}
            <div className="border-y overflow-hidden py-5" style={{ borderColor: BORDER }}>
                <motion.div
                    animate={{ x: [-1400, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex gap-8 whitespace-nowrap"
                >
                    {["Innovate", "Inspire", "Create", "Disrupt", "Heal", "Build", "Transform", "Innovate", "Inspire", "Create", "Disrupt", "Heal", "Build", "Transform"].map((item, i) => (
                        <span key={i} className="flex items-center gap-4 font-black uppercase" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
                            <span className={i % 2 === 0 ? "text-foreground" : "text-muted-foreground/40"}>{item}</span>
                            <span className="text-lg" style={{ color: ACCENT }}>✦</span>
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* ═══════════════ VENUE SECTION ═══════════════ */}
            <section className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
                <div className="flex flex-col lg:flex-row gap-0 rounded-3xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    {/* Map side */}
                    <div className="lg:w-1/2 relative min-h-[320px] lg:min-h-[480px]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.2971176909746!2d71.43616203908233!3d33.995492331174624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d910fb7687dd83%3A0x8a51a8a869531635!2sNorthwest%20School%20of%20Medicine%2C%20Peshawar!5e0!3m2!1sen!2s!4v1772317442416!5m2!1sen!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0"
                        />
                        {/* Map overlay gradient */}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent 70%, hsl(var(--background)))' }} />
                    </div>

                    {/* Details side */}
                    <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#0e0e0e]">
                        <p className="text-xs font-semibold tracking-[4px] uppercase mb-4" style={{ color: ACCENT }}>
                            Venue
                        </p>
                        <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight mb-6">
                            Northwest School<br />of <span style={{ color: ACCENT }}>Medicine</span>
                        </h2>
                        <p className="text-gray-500 dark:text-white/40 leading-relaxed mb-8">
                            Join us at one of Pakistan's premier medical institutions. Located in Peshawar, NWSM provides a state-of-the-art environment for our two-day AI symposium.
                        </p>

                        <div className="space-y-4 mb-8">
                            {[
                                { icon: <MapPin className="w-4 h-4" />, label: "Address", value: "Hayatabad, Phase 5, Peshawar, KPK" },
                                { icon: <Calendar className="w-4 h-4" />, label: "Dates", value: "April 10 – 11, 2026" },
                                { icon: <Clock className="w-4 h-4" />, label: "Timing", value: "9:00 AM – 5:00 PM (Both Days)" },
                                { icon: <Navigation className="w-4 h-4" />, label: "Parking", value: "On-campus parking available" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ACCENT_BG }}>
                                        <span style={{ color: ACCENT }}>{item.icon}</span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/25 mb-0.5">{item.label}</div>
                                        <div className="text-sm font-medium text-gray-700 dark:text-white/70">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a
                            href="https://maps.google.com/?q=Northwest+School+of+Medicine+Peshawar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300 hover:bg-white/5 w-fit"
                            style={{ color: ACCENT, border: `1px solid rgba(59,130,246,0.3)`, background: ACCENT_BG }}
                        >
                            Get Directions <ArrowUpRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════ CTA SECTION ═══════════════ */}
            <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
                <div className="rounded-3xl border p-12 md:p-20 text-center relative overflow-hidden" style={{ background: SURFACE, borderColor: BORDER }}>
                    {/* Decorative gradient */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none opacity-20"
                        style={{ background: ACCENT }}
                    />
                    <div className="relative z-10">
                        <p className="text-xs font-semibold tracking-[4px] uppercase mb-6" style={{ color: ACCENT }}>
                            Secure Your Spot
                        </p>
                        <h2 className="text-4xl md:text-7xl font-black uppercase leading-tight mb-4">
                            WE WOULD <span style={{ color: ACCENT }}>LOVE</span><br />
                            TO HAVE YOU<br />
                            <span style={{ color: ACCENT }}>JOIN US</span>
                        </h2>
                        <p className="text-gray-500 dark:text-white/40 max-w-md mx-auto mb-10 text-lg">
                            Two days of workshops, keynotes, competitions, and unparalleled networking. Register now before seats fill up.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => setIsRegistrationOpen(true)}
                                className="group flex items-center gap-3 text-black font-bold text-sm uppercase tracking-widest px-10 py-5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]"
                                style={{ background: ACCENT }}
                            >
                                Register Now
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FOOTER BAR ═══════════════ */}
            <footer className="border-t py-8 px-6 md:px-12" style={{ borderColor: BORDER }}>
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: ACCENT }} />
                        <span className="text-sm font-bold uppercase tracking-widest">GSRH × IRTIQA</span>
                    </div>
                    <p className="text-xs text-muted-foreground">© 2026 AI Symposium. Northwest School of Medicine, Peshawar.</p>
                </div>
            </footer>

            {/* ═══════════════ DETAIL MODAL ═══════════════ */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring" as const, damping: 25, stiffness: 300 }}
                            className="w-full max-w-[850px] max-h-[90vh] overflow-y-auto rounded-3xl relative z-10 scrollbar-hide"
                            style={{ background: "#0e0e0e", border: `1px solid ${BORDER}` }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal hero image */}
                            <div className="h-56 md:h-72 w-full relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent z-10" />
                                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                                <button
                                    className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full border flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
                                    style={{ borderColor: "#444", background: "rgba(0,0,0,0.5)" }}
                                    onClick={() => setSelectedEvent(null)}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-8 md:px-12 pb-12 relative z-20 -mt-12">
                                <span
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-5"
                                    style={{ background: ACCENT, color: "#000" }}
                                >
                                    {selectedEvent.category}
                                </span>

                                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight uppercase">
                                    {selectedEvent.title}
                                </h2>

                                <div className="flex flex-col md:flex-row gap-10">
                                    {/* Left: Details */}
                                    <div className="flex-grow space-y-8">
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: ACCENT }}>
                                                Abstract
                                            </h3>
                                            <p className="text-white/50 leading-relaxed text-lg">{selectedEvent.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { icon: <MapPin className="w-4 h-4" />, label: "Location", value: selectedEvent.location },
                                                { icon: <Clock className="w-4 h-4" />, label: "Time", value: selectedEvent.time },
                                                { icon: <Calendar className="w-4 h-4" />, label: "Date", value: selectedEvent.date },
                                                { icon: <Users className="w-4 h-4" />, label: "Capacity", value: selectedEvent.capacity },
                                            ].map((item, i) => (
                                                <div key={i} className="p-4 rounded-xl" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                                    <div className="flex items-center gap-2 mb-2" style={{ color: ACCENT }}>
                                                        {item.icon}
                                                        <span className="text-[10px] uppercase tracking-wider font-bold">{item.label}</span>
                                                    </div>
                                                    <div className="text-sm font-semibold text-white">{item.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Speaker card */}
                                    <div className="md:w-56 flex-shrink-0">
                                        <div className="rounded-2xl p-6 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                            <h3 className="text-[10px] font-bold uppercase tracking-[3px] mb-5" style={{ color: ACCENT }}>Speaker</h3>
                                            <img src={selectedEvent.speakerImage} alt={selectedEvent.speaker} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2" style={{ borderColor: BORDER }} />
                                            <div className="text-white font-bold text-base">{selectedEvent.speaker}</div>
                                            <div className="text-sm font-medium mt-1" style={{ color: ACCENT }}>{selectedEvent.speakerRole}</div>
                                            <p className="text-[9px] text-white/15 mt-3 italic leading-relaxed">Speakers and schedule are subject to change based on availability.</p>
                                        </div>

                                        <div className="mt-4 rounded-xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                                            <span className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Registration Fee</span>
                                            <span className="text-sm font-bold" style={{ color: ACCENT }}>{selectedEvent.fee}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="mt-10 pt-8 flex flex-col gap-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                                    <Button
                                        className="w-full font-bold h-14 text-base uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                                        style={{ background: ACCENT, color: "#000" }}
                                        onClick={() => {
                                            setSelectedEvent(null);
                                            setIsRegistrationOpen(true);
                                        }}
                                    >
                                        Register for Event
                                    </Button>

                                    {/* Competition-specific buttons */}
                                    {selectedEvent.id === "cmp-4" && (
                                        <Button
                                            variant="outline"
                                            className="w-full font-bold h-12 text-sm uppercase tracking-widest rounded-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                            onClick={() => {
                                                setSelectedEvent(null);
                                                setIsPitchFormOpen(true);
                                            }}
                                        >
                                            <Lightbulb className="w-4 h-4 mr-2" /> Submit Your Pitch Idea
                                        </Button>
                                    )}
                                    {selectedEvent.id === "cmp-1" && (
                                        <Button
                                            variant="outline"
                                            className="w-full font-bold h-12 text-sm uppercase tracking-widest rounded-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                            onClick={() => {
                                                setSelectedEvent(null);
                                                setIsPosterFormOpen(true);
                                            }}
                                        >
                                            <Award className="w-4 h-4 mr-2" /> Register Your Poster Topic
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isRegistrationOpen && <RegistrationForm onClose={() => setIsRegistrationOpen(false)} />}
                {isPitchFormOpen && <PitchForm onClose={() => setIsPitchFormOpen(false)} />}
                {isPosterFormOpen && <PosterForm onClose={() => setIsPosterFormOpen(false)} />}
                {isMemeFormOpen && <MemeForm onClose={() => setIsMemeFormOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default AISymposium;
