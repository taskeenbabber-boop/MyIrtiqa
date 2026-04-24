import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { X, MapPin, Clock, ArrowLeft, ArrowUpRight, ChevronRight, ChevronDown, Zap, Calendar, Users, Award, Navigation, Lightbulb, ShieldCheck, FileDown, Sparkles, Tag, Linkedin, Globe, Menu, User, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "@/components/symposium/RegistrationForm";
import { PitchForm } from "@/components/symposium/PitchForm";
import { PosterForm } from "@/components/symposium/PosterForm";
import { MemeForm } from "@/components/symposium/MemeForm";
import { QuizForm } from "@/components/symposium/QuizForm";
import { DrillForm } from "@/components/symposium/DrillForm";
import { DebateForm } from "@/components/symposium/DebateForm";
import { supabase } from "@/integrations/supabase/client";
import aiIconLogo from "@/assets/AI-icon.png";

/* ——— accent tokens ——— */
const ACCENT = "#3b82f6";       // vibrant blue
const ACCENT_LIGHT = "#60a5fa"; // lighter blue

/* ——— icon mapping for event thumbnails ——— */
function getEventIcon(title: string): string {
    const map: Record<string, string> = {
        "AI for Note Taking": "/icons/AI-Note-Taking.png",
        "Prompt Engineering & AI in Design": "/icons/Prompt-Engineering.png",
        "AI in Research": "/icons/AI-in-Research.png",
        "Hands-On Suturing Workshop": "/icons/Clinical-Audit.png",
        "From Idea to Impact: Launch Your Startup": "/icons/Thinking-Like-a-Builder.png",
        "Clinical Audit & AI in Clinical Use": "/icons/Clinical-Audit.png",
        "AI and the Future of Global Surgery": "/icons/AI-and-the-Future-of-Global-Surgery.png",
        "Thinking Like a Builder: AI Solutions in Healthcare": "/icons/Thinking-Like-a-Builder.png",
        "Human Expertise vs AI Systems": "/icons/Human-Expertise-vs-AI-Systems.png",
        "AI Poster Competition": "/icons/AI-Poster-Competition.png",
        "AI Drill": "/icons/AI-Drill.png",
        "AI Debate": "/icons/AI-Debate.png",
        "AI Pitch Competition": "/icons/AI-Pitch-Competition.png",
    };
    for (const [key, val] of Object.entries(map)) {
        if (title.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(title.toLowerCase())) return val;
    }
    return "/icons/AI-Note-Taking.png";
}

const SYMPOSIUM_EVENTS = [
    {
        id: "ws-4", category: "Workshop", title: "Clinical Audit & AI in Clinical Use",
        speaker: "Dr. Almas Fasih Khattak", speakerRole: "Asst. Director GSRH | Director Research HMC",
        speakerImage: "https://i.ibb.co/gbhNLhWy/Almas-Fasih-Khattak.jpg",
        location: "Workshop Room 1 • Hybrid", time: "10:00 AM – 12:00 PM", date: "7 May 2026",
        image: "/icons/Clinical-Audit.png",
        description: "Exploring the practical application of AI in clinical settings. Covering diagnostic support algorithms, patient data auditing, and the integration of AI models in secure hospital workflows.",
        fee: "Students: 500 PKR | Faculty/Doctors: 1000 PKR", capacity: "100 Seats",
        socialUrl: "https://scholar.google.com/citations?user=unOLrykAAAAJ&hl=en"
    },
    {
        id: "ws-2", category: "Workshop", title: "Prompt Engineering: Talk to AI in Design",
        speaker: "Asad Raziq", speakerRole: "Visual Artist",
        speakerImage: "https://i.ibb.co/FkGZRYpd/Asad-Head-SHot.png",
        location: "Workshop Room 1 • Hybrid", time: "2:00 PM – 4:00 PM", date: "7 May 2026",
        image: "/icons/Prompt-Engineering.png",
        description: "Discover how to think, design, and build with AI. This session explores the power of prompt engineering, how to communicate with AI in a designer's language, and how tools like ChatGPT, Nano Banana, and Canva AI can transform ideas into visuals and personal brands.",
        fee: "Students: 500 PKR | Faculty/Doctors: 1000 PKR", capacity: "100 Seats",
        socialUrl: "https://www.linkedin.com/in/asadraziq"
    },
    {
        id: "ws-5", category: "Hand-on Workshop", title: "Suturing with a Plastic Surgeon",
        speaker: "Prof. Dr. Obaidullah", speakerRole: "Consultant Plastic & Reconstructive Surgeon",
        speakerImage: "/speakers/Dr-Obaidullah.png",
        location: "Skills Lab • Physical Only", time: "Full Day: 10 AM – 12 PM & 2 – 4 PM", date: "8 May 2026",
        image: "/icons/Clinical-Audit.png",
        description: "Master the art of surgical suturing in this intensive, hands-on workshop led by Prof. Dr. Obaidullah. Participants will learn fundamental and advanced suturing techniques on realistic simulation models.",
        fee: "1,000 PKR (All Categories)", capacity: "60 Seats (30 per session)"
    },
    {
        id: "ws-3", category: "Workshop", title: "How to Build and Scale a Startup",
        speaker: "Muhammad Waqar", speakerRole: "Founder, Black Byte",
        speakerImage: "/speakers/Muhammad-Waqar.png",
        location: "Workshop Room 2 • Hybrid", time: "2:00 PM – 4:00 PM", date: "8 May 2026",
        image: "/icons/Thinking-Like-a-Builder.png",
        description: "Ready to turn your idea into a real business? Join Muhammad Waqar for a high-energy workshop on building a startup from scratch. Learn how to identify market gaps, validate your ideas, build an MVP, and pitch to investors.",
        fee: "Students: 500 PKR | Faculty/Doctors: 1000 PKR", capacity: "100 Seats",
        socialUrl: "https://www.linkedin.com/in/muhammad-waqar-hacker"
    },
    {
        id: "cmp-1", category: "Competition", title: "AI Poster Competition",
        speaker: "Individual Participants", speakerRole: "Researchers",
        speakerImage: "https://images.unsplash.com/photo-1587614295999-6c1c13675117?auto=format&fit=crop&q=80&w=150",
        location: "Front Lobby", time: "TBA", date: "9 May 2026",
        image: "/icons/AI-Poster-Competition.png",
        description: "Individual poster presentation with a live demonstration of a chosen AI tool. Covers background, medical applications, ethical concerns, and future possibilities.",
        fee: "Included in Conference Pass", capacity: "Variable",
    },
    {
        id: "cmp-2", category: "Competition", title: "AI Drill",
        speaker: "Participants", speakerRole: "Problem Solvers",
        speakerImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=150",
        location: "Computer Lab", time: "1 Hour", date: "9 May 2026",
        image: "/icons/AI-Drill.png",
        description: "Fast, structured problem-solving challenge. Participants receive a medical case or research problem and have one hour to work through it using AI tools.",
        fee: "Included in Conference Pass", capacity: "Variable",
    },
    {
        id: "cmp-3", category: "Competition", title: "AI Debate",
        speaker: "Debaters", speakerRole: "Orators",
        speakerImage: "https://images.unsplash.com/photo-1475721025505-11900531505c?auto=format&fit=crop&q=80&w=150",
        location: "Debate Hall", time: "TBA", date: "9 May 2026",
        image: "/icons/AI-Debate.png",
        description: "Two-sided debate on motions like AI in clinical decisions, privacy threats, or role replacement. Judges evaluate structured reasoning and grounded understanding of healthcare AI.",
        fee: "Included in Conference Pass", capacity: "Structured Bracket",
    },
    {
        id: "cmp-4", category: "Competition", title: "AI Pitch Competition",
        speaker: "Innovators", speakerRole: "Entrepreneurs",
        speakerImage: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=150",
        location: "Pitch Room", time: "5m Pitch + 3m Q&A", date: "9 May 2026",
        image: "/icons/AI-Pitch-Competition.png",
        description: "Propose original AI-based solutions to a medical/research problem. Must include problem statement, AI solution, feasibility, workflow, and impact.",
        fee: "Included in Conference Pass", capacity: "Limited Slots",
    },
    {
        id: "cmp-5", category: "Competition", title: "AI Quiz",
        speaker: "Participants", speakerRole: "Knowledge Challengers",
        speakerImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=150",
        location: "Quiz Hall", time: "TBA", date: "9 May 2026",
        image: "/icons/AI-Drill.png",
        description: "Test your knowledge of AI concepts, applications in healthcare, and cutting-edge research. Rapid-fire quiz rounds covering AI fundamentals, medical AI, and ethical considerations.",
        fee: "Included in Conference Pass", capacity: "Open",
    },
    {
        id: "cmp-6", category: "Competition", title: "AI Memes Competition",
        speaker: "Participants", speakerRole: "Creative Minds",
        speakerImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=150",
        location: "Online + Venue", time: "TBA", date: "9 May 2026",
        image: "/icons/AI-Debate.png",
        description: "Create the funniest, most relatable AI-themed memes! Entries judged on creativity, humor, relevance to AI in healthcare, and originality. Submit online or in-person.",
        fee: "Included in Conference Pass", capacity: "Unlimited",
    }
];

const AISymposium = () => {
    const [searchParams] = useSearchParams();
    const referralCode = searchParams.get("ref") || "";
    const [activeTab, setActiveTab] = useState("home");
    const [events, setEvents] = useState(SYMPOSIUM_EVENTS);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [discountAppliesTo, setDiscountAppliesTo] = useState<string[]>([]);

    // Popup Forms State
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isPitchFormOpen, setIsPitchFormOpen] = useState(false);
    const [isPosterFormOpen, setIsPosterFormOpen] = useState(false);
    const [isMemeFormOpen, setIsMemeFormOpen] = useState(false);
    const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);
    const [isDrillFormOpen, setIsDrillFormOpen] = useState(false);
    const [isDebateFormOpen, setIsDebateFormOpen] = useState(false);

    // Track visitor + lookup discount when referral code is present
    useEffect(() => {
        if (!referralCode) return;
        // Log the visit (fire-and-forget)
        (supabase as any).from("symposium_referral_visits").insert({
            referral_code: referralCode,
            page_path: window.location.pathname,
        }).then(() => {});
        // Lookup discount
        (supabase as any).from("symposium_referral_codes")
            .select("discount_percent, discount_applies_to, active")
            .eq("code", referralCode)
            .eq("active", true)
            .single()
            .then(({ data }: any) => {
                if (data && data.discount_percent > 0) {
                    setDiscountPercent(data.discount_percent);
                    setDiscountAppliesTo(data.discount_applies_to || []);
                }
            });
    }, [referralCode]);

    useEffect(() => {
        const fetchSpeakers = async () => {
            const { data, error } = await supabase.from("symposium_speakers").select("*");
            if (error) {
                console.error("Error fetching speakers:", error);
                return;
            }
            if (data && data.length > 0) {
                const mappedEvents = data.map(item => ({
                    id: item.id,
                    category: item.event_category,
                    title: item.event_title,
                    speaker: item.name,
                    speakerRole: item.role,
                    speakerImage: item.image_url,
                    location: item.location,
                    time: item.time,
                    date: item.date,
                    image: getEventIcon(item.event_title),
                    description: item.description,
                    fee: item.fee,
                    capacity: item.capacity,
                    socialUrl: ""
                }));
                setEvents(mappedEvents);
            }
        };

        fetchSpeakers();
    }, []);

    // Helper functions for tabs
    const renderNav = () => (
        <div className="w-full flex items-center justify-between gap-4 mb-8 sticky top-4 z-30">
            <a
                href="/"
                className="hidden lg:flex items-center gap-2 bg-[#2a2d35] border border-[#3c3f4a] hover:border-blue-500/50 text-gray-400 hover:text-white px-4 py-3 rounded-xl transition-all shadow-lg font-bold text-[10px] uppercase tracking-widest group"
            >
                <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition-transform" />
                Back to Main Site
            </a>

            <nav className="flex-1 lg:flex-none flex justify-center flex-wrap gap-2 md:gap-4 bg-[#2a2d35] p-2 md:p-3 rounded-xl shadow-lg border border-[#3c3f4a] mx-auto">
                {['home', 'schedule', 'competitions', 'register'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`font-semibold uppercase tracking-wider text-[10px] md:text-xs px-3 md:px-5 py-2 transition-all relative ${activeTab === tab ? 'text-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-full" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="hidden lg:block w-32"></div> {/* Spacer to keep nav centered */}
        </div>
    );

    const renderHome = () => (
        <div className="flex flex-col items-center text-center space-y-10 animate-in fade-in duration-500 w-full">
            <div className="relative bg-[#1f2229] border border-[#3c3f4a] p-8 lg:p-14 rounded-2xl w-full shadow-xl overflow-hidden text-left flex flex-col md:flex-row items-center gap-10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-400/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex-1 space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                        Discover the Future <br />
                        <span className="text-blue-500 italic">AI Symposium 2026</span>
                    </h1>
                    <div className="text-xs md:text-sm uppercase tracking-widest font-mono text-gray-400">
                        &lt;i&gt; Intersecting AI, surgery, & clinical diagnostics &lt;/i&gt;
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base max-w-lg">
                        A three-day exploration where breakthrough meets bedside at NWSM. Join us for expert-led workshops, inspiring keynotes, and competitive tracks designed to transform healthcare.
                    </p>
                    <div className="pt-6">
                        <button
                            onClick={() => setActiveTab('register')}
                            className="bg-blue-600 hover:bg-transparent hover:text-blue-500 border-2 border-blue-600 text-white font-bold py-3 px-8 rounded-full transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center gap-2"
                        >
                            Explore Now <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="relative z-10 w-48 h-48 md:w-72 md:h-72 flex-shrink-0 flex items-center justify-center">
                    <img
                        src={aiIconLogo}
                        alt="AI Symposium Logo"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>

            <div className="w-full max-w-5xl mx-auto text-left">
                <div className="text-xs tracking-widest uppercase text-blue-400 font-bold mb-4 ml-2 border-l-2 border-blue-500 pl-3">Event Stats</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { val: "3", label: "Days Of Innovation" },
                        { val: "15+", label: "Sessions & Events" },
                        { val: "5", label: "Workshops" },
                        { val: "1500+", label: "Delegates Expected" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#1f2229] border border-[#3c3f4a] p-6 rounded-xl text-center shadow-lg transform transition-all hover:-translate-y-1">
                            <div className="text-4xl font-black text-blue-500 mb-2">{stat.val}</div>
                            <div className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 font-semibold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-5xl mx-auto bg-[#1f2229] border border-blue-500/30 p-8 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.1)] flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-blue-400 uppercase tracking-widest text-[10px] font-bold mb-2">
                        <Sparkles className="w-4 h-4" /> Delegate Pricing Passes
                    </div>
                    <h3 className="text-2xl font-bold text-white">Full 3-Day Conference Pass</h3>
                    <p className="text-sm text-gray-400 max-w-md">Access all keynotes, panels, competitions, and networking events. Includes a verifiable digital certificate of attendance. It does not include suturing workshop</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="bg-[#2a2d35] p-5 rounded-xl border border-[#3c3f4a] text-center flex-1 sm:min-w-[140px]">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">General Student</div>
                        <div className="text-2xl font-black text-white">Rs. 2000</div>
                    </div>
                    <div className="bg-blue-600/10 p-5 rounded-xl border border-blue-500 text-center flex-1 sm:min-w-[140px] relative">
                        <div className="absolute -top-3 -right-2 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">+25% Off</div>
                        <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-2 font-bold">NWSM Student</div>
                        <div className="text-2xl font-black text-white">Rs. 1500</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSchedule = () => {
        const scheduleEvents = events.filter(e =>
            e.category.toLowerCase().includes('workshop') || e.category.toLowerCase().includes('competition')
        );
        const dates = [...new Set(scheduleEvents.map(e => e.date))];
        // Sort dates: 7 May, 8 May, 9 May
        dates.sort((a, b) => {
            const dayA = parseInt(a) || 0;
            const dayB = parseInt(b) || 0;
            return dayA - dayB;
        });

        return (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500 w-full text-left">
                <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3"><Calendar className="text-blue-500" /> Full Event Schedule</h2>
                {dates.map(date => (
                    <div key={date} className="mb-10">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">{date}</span>
                            <div className="h-[1px] flex-1 bg-[#3c3f4a]"></div>
                        </div>
                        <div className="grid gap-6">
                            {scheduleEvents.filter(e => e.date === date).map(event => (
                                <div key={event.id} className="bg-[#1f2229] border border-[#3c3f4a] p-6 rounded-xl flex flex-col md:flex-row gap-6 hover:border-blue-500 transition-colors shadow-lg group">
                                    <div className="w-16 h-16 rounded-xl bg-[#2a2d35] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                        {event.image ? <img src={event.image} alt={event.title} className="w-10 h-10 object-contain" /> : <Navigation className="text-blue-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                                                event.category.toLowerCase().includes('competition')
                                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    : 'bg-[#2a2d35] text-blue-400 border-blue-500/20'
                                            }`}>{event.category}</span>
                                            <span className="text-gray-400 text-xs flex items-center gap-1.5"><Clock className="w-3 h-3 text-blue-500" /> {event.time}</span>
                                            <span className="text-gray-400 text-xs flex items-center gap-1.5"><MapPin className="w-3 h-3 text-blue-500" /> {event.location}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                                        <p className="text-sm text-gray-400 mb-4">{event.description}</p>

                                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#3c3f4a] pt-4 mt-4">
                                            <div className="flex items-center gap-3 bg-[#2a2d35] px-3 py-2 rounded-lg">
                                                {event.speakerImage ? <img src={event.speakerImage} alt={event.speaker} className="w-10 h-10 rounded-full object-cover border-2 border-[#1f2229]" /> : <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center border-2 border-[#1f2229]"><User className="w-5 h-5" /></div>}
                                                <div>
                                                    <div className="text-sm font-bold text-white">{event.speaker}</div>
                                                    <div className="text-[10px] text-gray-400">{event.speakerRole}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Entry Fee</div>
                                                <div className="text-sm text-blue-400 font-bold">{event.fee}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderCompetitions = () => (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 w-full text-left">
            <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3"><Award className="text-blue-500" /> AI Competitions</h2>
            <div className="grid md:grid-cols-2 gap-6">
                {events.filter(e => e.category.toLowerCase().includes('competition')).map(event => (
                    <div key={event.id} className="bg-[#1f2229] border border-[#3c3f4a] p-6 rounded-xl hover:border-blue-500 transition-colors shadow-lg flex flex-col group">
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#3c3f4a]">
                            <div className="w-12 h-12 rounded-lg bg-[#2a2d35] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                {event.image ? <img src={event.image} alt={event.title} className="w-8 h-8 object-contain" /> : <ShieldCheck className="text-blue-500" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 uppercase tracking-wider"><MapPin className="w-3 h-3 text-blue-500" /> {event.location} • {event.date}</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 flex-1 mb-6">{event.description}</p>

                        {/* Dynamic Button based on Competition */}
                        {event.title.includes('Pitch') && (
                            <button onClick={() => setIsPitchFormOpen(true)} className="w-full bg-transparent hover:bg-blue-600/10 text-white font-bold py-3 rounded-full text-sm transition-colors border border-[#3c3f4a] hover:border-blue-500 hover:text-blue-400 flex items-center justify-center gap-2 uppercase tracking-wide">
                                Submit Pitch Idea <Plus className="w-4 h-4" />
                            </button>
                        )}
                        {event.title.includes('Poster') && (
                            <button onClick={() => setIsPosterFormOpen(true)} className="w-full bg-transparent hover:bg-blue-600/10 text-white font-bold py-3 rounded-full text-sm transition-colors border border-[#3c3f4a] hover:border-blue-500 hover:text-blue-400 flex items-center justify-center gap-2 uppercase tracking-wide">
                                Register Poster <Plus className="w-4 h-4" />
                            </button>
                        )}
                        {event.title.includes('Meme') && (
                            <button onClick={() => setIsMemeFormOpen(true)} className="w-full bg-transparent hover:bg-blue-600/10 text-white font-bold py-3 rounded-full text-sm transition-colors border border-[#3c3f4a] hover:border-blue-500 hover:text-blue-400 flex items-center justify-center gap-2 uppercase tracking-wide">
                                Submit Meme <Plus className="w-4 h-4" />
                            </button>
                        )}
                        {event.title.includes('Quiz') && (
                            <button onClick={() => setIsQuizFormOpen(true)} className="w-full bg-transparent hover:bg-blue-600/10 text-white font-bold py-3 rounded-full text-sm transition-colors border border-[#3c3f4a] hover:border-blue-500 hover:text-blue-400 flex items-center justify-center gap-2 uppercase tracking-wide">
                                Register for Quiz <Plus className="w-4 h-4" />
                            </button>
                        )}
                        {event.title.includes('Drill') && (
                            <button onClick={() => setIsDrillFormOpen(true)} className="w-full bg-transparent hover:bg-blue-600/10 text-white font-bold py-3 rounded-full text-sm transition-colors border border-[#3c3f4a] hover:border-blue-500 hover:text-blue-400 flex items-center justify-center gap-2 uppercase tracking-wide">
                                Join AI Drill <Plus className="w-4 h-4" />
                            </button>
                        )}
                        {event.title.includes('Debate') && (
                            <button onClick={() => setIsDebateFormOpen(true)} className="w-full bg-transparent hover:bg-blue-600/10 text-white font-bold py-3 rounded-full text-sm transition-colors border border-[#3c3f4a] hover:border-blue-500 hover:text-blue-400 flex items-center justify-center gap-2 uppercase tracking-wide">
                                Register for Debate <Plus className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRegister = () => (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500 w-full text-left">
            <div className="bg-[#1f2229] border border-[#3c3f4a] p-8 md:p-12 rounded-2xl text-center shadow-xl mb-8">
                <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-6 opacity-80" />
                <h2 className="text-3xl font-black text-white mb-4">Symposium Registration</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm">
                    Register for the Main Symposium, select your workshops, and secure your spot. Valid student IDs required for discounted pricing.
                </p>
                <button
                    onClick={() => setIsRegistrationOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-full text-base tracking-widest uppercase shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-1 inline-flex items-center justify-center gap-2"
                >
                    Register Now <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="bg-[#1f2229] border border-[#3c3f4a] p-8 md:p-10 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Quick Form Access</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <button onClick={() => setIsPitchFormOpen(true)} className="bg-[#2a2d35] hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400 border border-[#3c3f4a] p-4 rounded-xl text-sm font-bold text-white transition-all flex flex-col items-center gap-2 text-center group">
                        <Lightbulb className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" /> Submit Pitch
                    </button>
                    <button onClick={() => setIsPosterFormOpen(true)} className="bg-[#2a2d35] hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400 border border-[#3c3f4a] p-4 rounded-xl text-sm font-bold text-white transition-all flex flex-col items-center gap-2 text-center group">
                        <Award className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" /> Submit Poster
                    </button>
                    <button onClick={() => setIsMemeFormOpen(true)} className="bg-[#2a2d35] hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400 border border-[#3c3f4a] p-4 rounded-xl text-sm font-bold text-white transition-all flex flex-col items-center gap-2 text-center group">
                        <Zap className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" /> Submit AI Meme
                    </button>
                    <button onClick={() => setIsQuizFormOpen(true)} className="bg-[#2a2d35] hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400 border border-[#3c3f4a] p-4 rounded-xl text-sm font-bold text-white transition-all flex flex-col items-center gap-2 text-center group">
                        <FileDown className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" /> AI Quiz Sub.
                    </button>
                </div>
            </div>
        </div>
    );

    // Render left side bar specific component
    const renderSidebar = () => (
        <div className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#20202a] flex flex-col shadow-2xl transition-transform duration-300 z-[100] lg:z-[50] overflow-y-auto 
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="absolute top-4 right-4 lg:hidden">
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white p-2">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-8 text-center border-b border-[#3c3f4a]">
                <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center bg-[#2a2d35] rounded-full overflow-hidden border-2 border-[#1f2229] shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <img src={aiIconLogo} alt="AI Symposium" className="w-16 h-16 object-contain" />
                </div>
                <h2 className="text-xl font-bold text-white">AI Symposium</h2>
                <p className="text-[#8c8c8e] text-xs uppercase tracking-wider mt-1">2026 Edition</p>

                <div className="flex justify-center gap-3 mt-4">
                    <a href="/" className="w-8 h-8 rounded-full bg-[#2a2d35] text-gray-400 flex items-center justify-center hover:text-blue-500 transition-colors" title="Back to Main Site"><Navigation className="w-4 h-4" /></a>
                    <a href="https://www.linkedin.com/company/107931100/" target="_blank" className="w-8 h-8 rounded-full bg-[#2a2d35] text-gray-400 flex items-center justify-center hover:text-blue-500 transition-colors"><Linkedin className="w-4 h-4" /></a>
                    <a href="#" className="w-8 h-8 rounded-full bg-[#2a2d35] text-gray-400 flex items-center justify-center hover:text-blue-500 transition-colors"><Mail className="w-4 h-4" /></a>
                </div>
            </div>

            <div className="p-8 space-y-6 text-[#8c8c8e] flex-1">
                <div className="space-y-3 pb-6 border-b border-[#3c3f4a] text-sm">
                    <div className="flex justify-between items-center"><span className="text-white">Dates:</span><span>May 7-9, 2026</span></div>
                    <div className="flex justify-between items-center"><span className="text-white">Venue:</span><span>NWSM</span></div>
                    <div className="flex justify-between items-center"><span className="text-white">Status:</span><span className="text-emerald-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Accepting</span></div>
                </div>

                <div className="space-y-4 pb-6 border-b border-[#3c3f4a]">
                    <h3 className="text-white font-bold text-sm tracking-wider uppercase">Event Highlights</h3>
                    <div className="space-y-4 text-xs">
                        <div className="bg-[#2a2d35] p-3 rounded-lg border border-[#3c3f4a]/50">
                            <div className="text-blue-500 font-bold mb-1 uppercase tracking-tighter">7 May</div>
                            <div className="text-gray-300">Audit, Prompt Engineering</div>
                        </div>
                        <div className="bg-[#2a2d35] p-3 rounded-lg border border-[#3c3f4a]/50">
                            <div className="text-blue-500 font-bold mb-1 uppercase tracking-tighter">8 May</div>
                            <div className="text-gray-300">Suturing, Building a Startup</div>
                        </div>
                        <div className="bg-blue-600/10 p-3 rounded-lg border border-blue-500/30">
                            <div className="text-blue-400 font-bold mb-1 uppercase tracking-tighter">9 May — Main Event</div>
                            <div className="text-gray-300">Competitions, Keynotes, Panels</div>
                        </div>
                        <div className="pt-2">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <div className="h-[1px] flex-1 bg-[#3c3f4a]"></div> Free Online <div className="h-[1px] flex-1 bg-[#3c3f4a]"></div>
                            </div>
                            <ul className="space-y-2 text-gray-400">
                                <li className="flex gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>AI for Note Taking <span className="text-gray-600 block text-[9px]">Haroon Ahmad</span></span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>Building Custom GPTs <span className="text-gray-600 block text-[9px]">Rehan Yaqoob</span></span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>AI in Research <span className="text-gray-600 block text-[9px]">Iftikhar Khan</span></span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>Vibe Coding <span className="text-gray-600 block text-[9px]">Dr. Taskeen Baber</span></span>
                                </li>
                            </ul>
                            <div className="mt-4 pt-2 border-t border-[#3c3f4a]/30">
                                <a
                                    href="https://forms.gle/i4W1H38FamWumoVu9"
                                    target="_blank"
                                    className="w-full bg-blue-600/10 hover:bg-blue-600 border border-blue-600 text-blue-500 hover:text-white font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/5 group"
                                >
                                    Register for free Workshops <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full border border-blue-500"></div> AI Integration</div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full border border-blue-500"></div> Live Workshops</div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full border border-blue-500"></div> Networking Events</div>
                </div>
            </div>

            <div className="p-8 pt-0 mt-auto flex flex-col gap-4">
                <a href="/" className="text-center text-blue-500 hover:text-blue-400 uppercase tracking-widest text-[10px] font-bold border-t border-[#3c3f4a] pt-4 flex items-center justify-center gap-2 transition-colors">
                    BACK TO MAIN SITE <ArrowUpRight className="w-3 h-3" />
                </a>
                <button
                    onClick={() => setIsRegistrationOpen(true)}
                    className="w-full text-center text-[#8c8c8e] hover:text-white uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-2 transition-colors border-t border-[#3c3f4a] pt-4"
                >
                    GET TICKET <FileDown className="w-3 h-3" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#191923] text-gray-200 selection:bg-blue-500/30 font-sans">
            {/* Mobile Top Bar */}
            <div className="lg:hidden w-full bg-[#20202a] px-6 py-4 flex items-center justify-between sticky top-0 z-[60] shadow-md">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors relative z-[110]">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="font-bold text-white flex items-center gap-2">
                    <img src={aiIconLogo} alt="AI Symposium" className="w-6 h-6 object-contain" />
                    AI Symposium '26
                </div>
                <div className="w-6"></div> {/* Spacer for balance */}
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[90] lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Left */}
            {renderSidebar()}

            {/* Main Content Area */}
            <div className="flex-1 w-full flex flex-col relative overflow-hidden transition-all duration-300">
                {/* Clean BG Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:pt-12 lg:pt-8 relative z-10 flex-1 flex flex-col">
                    {renderNav()}

                    <div className="flex-1 flex flex-col w-full h-full pb-12">
                        {activeTab === 'home' && renderHome()}
                        {activeTab === 'schedule' && renderSchedule()}
                        {activeTab === 'competitions' && renderCompetitions()}
                        {activeTab === 'register' && renderRegister()}
                    </div>
                </div>
            </div>

            {/* Popups */}
            {isRegistrationOpen && <RegistrationForm onClose={() => setIsRegistrationOpen(false)} referralCode={referralCode} discountPercent={discountAppliesTo.includes('registration') ? discountPercent : 0} onOpenCompetitionForm={(type) => {
                setIsRegistrationOpen(false);
                const formMap: Record<string, (v: boolean) => void> = { pitch: setIsPitchFormOpen, poster: setIsPosterFormOpen, meme: setIsMemeFormOpen, quiz: setIsQuizFormOpen, drill: setIsDrillFormOpen, debate: setIsDebateFormOpen };
                formMap[type]?.(true);
            }} />}
            {isPitchFormOpen && <PitchForm onClose={() => setIsPitchFormOpen(false)} referralCode={referralCode} discountPercent={discountAppliesTo.includes('pitch') ? discountPercent : 0} />}
            {isPosterFormOpen && <PosterForm onClose={() => setIsPosterFormOpen(false)} referralCode={referralCode} discountPercent={discountAppliesTo.includes('poster') ? discountPercent : 0} />}
            {isMemeFormOpen && <MemeForm onClose={() => setIsMemeFormOpen(false)} referralCode={referralCode} />}
            {isQuizFormOpen && <QuizForm onClose={() => setIsQuizFormOpen(false)} referralCode={referralCode} discountPercent={discountAppliesTo.includes('quiz') ? discountPercent : 0} />}
            {isDrillFormOpen && <DrillForm onClose={() => setIsDrillFormOpen(false)} referralCode={referralCode} discountPercent={discountAppliesTo.includes('drill') ? discountPercent : 0} />}
            {isDebateFormOpen && <DebateForm onClose={() => setIsDebateFormOpen(false)} referralCode={referralCode} discountPercent={discountAppliesTo.includes('debate') ? discountPercent : 0} />}
        </div>
    );
};

export default AISymposium;
