import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, Award, Zap, Calendar, MapPin, Clock, Sparkles, ChevronRight, Brain, GraduationCap } from "lucide-react";
import iconResearch from "@/assets/icon-research.png";
import iconMentorship from "@/assets/icon-mentorship.png";
import iconQuality from "@/assets/icon-quality.png";
import { AnimatedTestimonials } from "@/components/home/AnimatedTestimonials";
import { KeyAchievements } from "@/components/home/KeyAchievements";
import { ScientificBackground } from "@/components/home/ScientificBackground";
import { motion } from "framer-motion";
import aiIconLogo from "@/assets/AI-icon.png";

/* ——— Symposium highlight events ——— */
const UPCOMING_EVENTS = [
  {
    title: "AI for Note Taking",
    category: "Workshop",
    date: "10 Apr 2026",
    time: "10:00 AM – 12:00 PM",
    speaker: "Haroon",
    color: "#3b82f6",
  },
  {
    title: "Prompt Engineering & AI in Design",
    category: "Workshop",
    date: "10 Apr 2026",
    time: "10:00 AM – 12:00 PM",
    speaker: "Mr. Asad",
    color: "#8b5cf6",
  },
  {
    title: "AI in Research",
    category: "Workshop",
    date: "10 Apr 2026",
    time: "3:00 PM – 4:00 PM",
    speaker: "Iftikhar",
    color: "#06b6d4",
  },
  {
    title: "AI Pitch Competition",
    category: "Competition",
    date: "11 Apr 2026",
    time: "10:00 AM – 12:00 PM",
    speaker: "Panel Judges",
    color: "#f59e0b",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative pt-16 overflow-hidden min-h-[80vh] sm:min-h-[85vh] md:min-h-[90vh]">
        <ScientificBackground />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/30 via-background/60 to-background pointer-events-none" />

        {/* Animated accent blobs */}
        <div className="absolute z-[1] w-[50vw] h-[50vw] rounded-full top-1/4 -left-1/4 bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute z-[1] w-[40vw] h-[40vw] rounded-full bottom-0 right-0 bg-purple-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32">
          <div className="max-w-5xl mx-auto text-center space-y-5 sm:space-y-6 md:space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-widest uppercase px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-primary/30 bg-primary/5 text-primary">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Empowering Researchers Since 2024
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight"
            >
              Start from a point.{" "}
              <span className="text-gradient relative">
                Grow with IRTIQA.
                <motion.span
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  style={{ transformOrigin: 'left' }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto px-2"
            >
              Empowering researchers and learners through quality training, innovation, and mentorship
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Link
                to="/ai-symposium"
                className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
              >
                <Zap className="mr-2 h-4 w-4" />
                AI Symposium 2026
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/ambassadors"
                className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 rounded-full hover:-translate-y-0.5 shadow-lg border border-purple-500/30 hover:border-purple-400/50"
                style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(99,102,241,0.8))", backdropFilter: "blur(10px)" }}
              >
                <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="w-4 h-4 mr-2" />
                Become an Ambassador
              </Link>

              <Link
                to="/verify"
                className="w-full sm:w-auto group inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold transition-all duration-300 rounded-full border border-foreground/10 bg-foreground/5 backdrop-blur-md hover:bg-foreground/10 hover:border-foreground/20 text-foreground"
              >
                <Award className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                Verify Certificate
              </Link>
            </motion.div>
          </div>

          {/* Trust Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="max-w-5xl mx-auto mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center"
          >
            {[
              { value: "550+", label: "Learners Trained" },
              { value: "16", label: "Sessions Delivered" },
              { value: "15", label: "Expert Tutors" },
              { value: "95%", label: "Success Rate" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-1 sm:space-y-2"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ AI SYMPOSIUM FEATURED ═══════════════════ */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#0a0f1a]" />
        <div className="absolute z-0 w-[60vw] h-[60vw] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/5 blur-[150px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[4px] uppercase px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 mb-6">
              <Zap className="w-3 h-3" /> Featured Event
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mt-4 mb-4">
              AI Symposium <span className="text-blue-400">2026</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              A two-day exploration at the intersection of AI, neurosurgery, and clinical diagnostics
            </p>
          </motion.div>

          {/* Main spotlight card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-5xl mx-auto mb-16"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="grid md:grid-cols-5 gap-0">
                {/* Left: AI Logo + Info */}
                <div className="md:col-span-2 flex flex-col items-center justify-center p-10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-b md:border-b-0 md:border-r border-white/10">
                  <motion.img
                    src={aiIconLogo}
                    alt="AI Symposium"
                    className="w-40 md:w-48 h-auto mb-6"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">GSRH × IRTIQA</div>
                    <div className="text-sm text-white/40">Peshawar, Pakistan</div>
                  </div>
                </div>

                {/* Right: Details */}
                <div className="md:col-span-3 p-10 flex flex-col justify-center space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/70">
                      <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-sm">April 10–11, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-sm">Northwest School of Medicine, Peshawar</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <Users className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-sm">150+ Expected Attendees</span>
                    </div>
                  </div>

                  <p className="text-white/50 text-sm leading-relaxed">
                    Workshops, keynotes, panel discussions, pitch & poster competitions — two days packed with AI-driven innovation for healthcare.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      to="/ai-symposium"
                      className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                    >
                      Register Now <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/ambassadors"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                    >
                      <Users className="w-4 h-4" /> Become an Ambassador
                    </Link>
                    <Link
                      to="/ai-symposium"
                      className="inline-flex items-center gap-2 text-white/70 hover:text-white font-semibold text-sm uppercase tracking-wider px-6 py-3 rounded-full border border-white/20 hover:border-white/40 transition-all"
                    >
                      View Full Agenda <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Events Grid */}
          <div className="max-w-5xl mx-auto">
            <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Featured Workshops & Competitions
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {UPCOMING_EVENTS.map((event, i) => (
                <motion.div
                  key={event.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Link
                    to="/ai-symposium"
                    className="block group rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-white/20 hover:bg-white/8 transition-all duration-300"
                  >
                    <span
                      className="inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-3"
                      style={{ background: `${event.color}20`, color: event.color }}
                    >
                      {event.category}
                    </span>
                    <h4 className="text-white font-semibold text-sm mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                      {event.title}
                    </h4>
                    <div className="space-y-1 text-xs text-white/40">
                      <div>{event.date}</div>
                      <div>{event.time}</div>
                      <div className="text-white/30">{event.speaker}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Achievements Section */}
      <KeyAchievements />

      {/* What We Do Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">What We Do</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              IRTIQA provides structured research and skills training for students and professionals in Pakistan with openness to international collaborations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: iconResearch, title: "Research Training", desc: "Comprehensive programs teaching research methodologies, systematic reviews, and academic writing from the ground up" },
              { icon: iconMentorship, title: "Expert Mentorship", desc: "One-on-one guidance from experienced researchers and practitioners dedicated to your success" },
              { icon: iconQuality, title: "Quality Advancement", desc: "Proven frameworks and tools to elevate the quality of research and academic outputs" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="shadow-soft hover:shadow-medium transition-smooth border-2 hover:border-primary/20 h-full">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto">
                      <img src={item.icon} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-2xl font-heading font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Highlight */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Our Programs</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From intensive workshops to comprehensive courses — we have the right program for every stage of your research journey
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Brain className="h-8 w-8" />,
                  title: "AI Symposium",
                  desc: "A two-day symposium on AI in neurosurgery and clinical diagnostics with workshops and competitions.",
                  link: "/ai-symposium",
                  accent: "from-blue-500 to-purple-500",
                },
                {
                  icon: <GraduationCap className="h-8 w-8" />,
                  title: "Research Training",
                  desc: "Comprehensive video series covering research fundamentals, methodology, and academic writing.",
                  link: "/programs",
                  accent: "from-emerald-500 to-teal-500",
                },
                {
                  icon: <Award className="h-8 w-8" />,
                  title: "Certificate Verification",
                  desc: "Verified credentials for your achievements — recognized by institutions across Pakistan.",
                  link: "/verify",
                  accent: "from-amber-500 to-orange-500",
                },
              ].map((prog, i) => (
                <motion.div
                  key={prog.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Link to={prog.link} className="block group">
                    <Card className="shadow-soft hover:shadow-large transition-all duration-300 border-2 hover:border-primary/20 h-full group-hover:-translate-y-1">
                      <CardContent className="p-8 space-y-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${prog.accent} flex items-center justify-center text-white`}>
                          {prog.icon}
                        </div>
                        <h3 className="text-xl font-heading font-semibold group-hover:text-primary transition-colors">{prog.title}</h3>
                        <p className="text-muted-foreground text-sm">{prog.desc}</p>
                        <div className="flex items-center text-primary text-sm font-semibold pt-2">
                          Learn more <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8">
              Making Research Accessible
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              We believe everyone deserves quality research training, regardless of their background or location
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <BookOpen className="h-12 w-12 text-primary mx-auto" />, title: "Practical Learning", desc: "Real-world examples and hands-on exercises" },
                { icon: <Users className="h-12 w-12 text-primary mx-auto" />, title: "Community Support", desc: "Join a network of passionate learners" },
                { icon: <Award className="h-12 w-12 text-primary mx-auto" />, title: "Recognized Certificates", desc: "Verified credentials for your achievements" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-2"
                >
                  {item.icon}
                  <h3 className="text-2xl font-heading font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <AnimatedTestimonials />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              Ready to Begin Your Research Journey?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join hundreds of learners who have transformed their research skills with IRTIQA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="shadow-large hover:shadow-glow transition-smooth"
              >
                <Link to="/ai-symposium">
                  AI Symposium 2026 <Zap className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
