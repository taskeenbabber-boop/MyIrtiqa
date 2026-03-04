import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronDown } from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
}

export default function Gallery() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏆</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Gallery Coming Soon</h2>
          <p className="text-muted-foreground leading-relaxed">
            We're curating our collection of milestones and achievements. Check back soon to explore our journey!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-background">
      {/* Hero Section with Scroll Indicator */}
      <div className="h-screen flex flex-col items-center justify-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="text-foreground">Our </span>
            <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Celebrating milestones, achievements, and moments that define our journey
          </p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-muted-foreground font-medium">Scroll to Explore</span>
          <ChevronDown className="h-6 w-6 text-primary" />
        </motion.div>
      </div>

      {/* Sticky Scroll Gallery Items */}
      {achievements.map((achievement, index) => (
        <StickyScrollItem
          key={achievement.id}
          achievement={achievement}
          index={index}
        />
      ))}
    </div>
  );
}

function StickyScrollItem({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Scale from 0 to 1 as user scrolls through this section
  const scale = useTransform(scrollYProgress, [0.1, 0.5, 1], [0, 1, 1]);
  const borderRadius = useTransform(scrollYProgress, [0.1, 0.5, 1], [100, 0, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.5, 0.7, 1], [0, 0, 1, 1]);

  return (
    <div
      ref={containerRef}
      className="relative h-[120vh] flex items-center justify-center"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale, borderRadius }}
          className="relative w-full h-full"
        >
          {/* Image */}
          <img
            src={achievement.image_url}
            alt={achievement.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Text Content */}
          <motion.div
            style={{ opacity: textOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-12"
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 max-w-4xl leading-tight">
              {achievement.title}
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl leading-relaxed font-light">
              {achievement.description}
            </p>
          </motion.div>

          {/* Achievement Number Badge */}
          <motion.div
            style={{ opacity: textOpacity }}
            className="absolute top-8 right-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center"
          >
            <span className="text-2xl md:text-3xl font-bold text-white">
              {String(index + 1).padStart(2, "0")}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
