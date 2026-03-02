import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
interface Achievement {
  id: number;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
}
export function KeyAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    async function fetchAchievements() {
      const {
        data,
        error
      } = await supabase.from("achievements").select("*").eq("is_active", true).order("display_order", {
        ascending: true
      }).limit(9);
      if (!error && data) {
        setAchievements(data);
      }
      setLoading(false);
    }
    fetchAchievements();
  }, []);

  // Fill empty slots with placeholders if less than 9 achievements
  const displayAchievements = [...achievements];
  while (displayAchievements.length < 9) {
    displayAchievements.push({
      id: -displayAchievements.length - 1,
      title: "",
      description: "",
      image_url: "",
      display_order: displayAchievements.length
    });
  }
  if (loading) {
    return <section className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>;
  }
  if (achievements.length === 0) {
    return null;
  }
  return <section ref={sectionRef} className="relative">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 dark:opacity-20" style={{
      backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)
          `,
      backgroundSize: '50px 50px',
      maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)'
    }} />

      {/* Header */}
      

      {/* Scroll Track */}
      

      {/* Footer CTA */}
      

      {/* CSS for scroll-driven animations */}
      <style>{`
        @supports (animation-timeline: scroll()) {
          .scroll-track {
            view-timeline-name: --grid-scroll;
          }
          
          .achievement-grid {
            animation: grid-zoom-reveal linear both;
            animation-timeline: --grid-scroll;
            animation-range: entry 0% cover 80%;
          }
          
          .achievement-grid > div:not(:nth-child(5)) {
            animation: fade-in-siblings linear both;
            animation-timeline: --grid-scroll;
            animation-range: entry 10% cover 50%;
          }
        }
        
        @supports not (animation-timeline: scroll()) {
          .achievement-grid {
            opacity: 1 !important;
            transform: scale(1) !important;
          }
          
          .achievement-grid > div {
            opacity: 1 !important;
          }
        }
        
        @keyframes grid-zoom-reveal {
          0% {
            transform: scale(5);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fade-in-siblings {
          0% { opacity: 0; }
          25% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @media (min-width: 768px) {
          .achievement-grid {
            grid-template-columns: repeat(3, 150px) !important;
            grid-template-rows: repeat(3, 150px) !important;
          }
        }
        
        @media (min-width: 1024px) {
          .achievement-grid {
            grid-template-columns: repeat(3, 200px) !important;
            grid-template-rows: repeat(3, 200px) !important;
          }
        }
      `}</style>
    </section>;
}