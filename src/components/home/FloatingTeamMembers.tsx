import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  email: string;
  linkedin_url?: string;
  image_url: string;
  featured: boolean;
  order_index: number;
}

export const FloatingTeamMembers = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const { data, error } = await (supabase as any)
      .from("team_profiles")
      .select("*")
      .eq("featured", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching team members:", error);
      return;
    }

    setTeamMembers(data || []);
  };

  const handleMouseEnter = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredIndex(index);
    updateTooltipPosition(event.currentTarget);
  };

  const updateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let top = rect.top - tooltipHeight - 16;

    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }

    if (top < 16) {
      top = rect.bottom + 16;
    }

    setTooltipPosition({ top, left });
  };

  return (
    <div className="mt-12">
      <div className="text-center mb-6">
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          Meet Our Core Team
        </h3>
      </div>
      
      {/* Mobile: Single line with overlap */}
      {isMobile ? (
        <div className="flex justify-center items-center px-4">
          <div className="flex -space-x-4 pb-4">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                className="relative flex-shrink-0"
                style={{ zIndex: teamMembers.length - index }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div 
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-background shadow-lg cursor-pointer transition-all duration-300 active:scale-110 hover:z-50"
                  onClick={(e) => handleMouseEnter(index, e)}
                >
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Desktop: Single line floating layout */
        <div className="relative max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-2">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                animate={{
                  y: [0, -6, 0],
                  transition: {
                    duration: 2.5 + (index % 3) * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }
                }}
              >
                <motion.div
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-smooth shadow-soft hover:shadow-medium cursor-pointer"
                  onMouseEnter={(e) => handleMouseEnter(index, e)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && teamMembers[hoveredIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 w-80 bg-card border-2 border-primary/20 rounded-lg shadow-large p-4"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              pointerEvents: isMobile ? "auto" : "none"
            }}
            onClick={() => isMobile && setHoveredIndex(null)}
          >
            <div className="flex items-start gap-4">
              <img
                src={teamMembers[hoveredIndex].image_url}
                alt={teamMembers[hoveredIndex].name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-bold text-lg text-foreground mb-1">
                  {teamMembers[hoveredIndex].name}
                </h4>
                <p className="text-sm text-primary font-medium mb-2">
                  {teamMembers[hoveredIndex].role}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
              {teamMembers[hoveredIndex].bio}
            </p>

            {teamMembers[hoveredIndex].linkedin_url && (
              <a
                href={teamMembers[hoveredIndex].linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
                LinkedIn Profile
              </a>
            )}
            
            {/* Tooltip pointer */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-2">
              <div className="w-4 h-4 bg-card border-r-2 border-b-2 border-primary/20 rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile to close tooltip */}
      {isMobile && hoveredIndex !== null && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setHoveredIndex(null)}
        />
      )}
    </div>
  );
};