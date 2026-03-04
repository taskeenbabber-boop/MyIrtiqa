import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  email: string;
  linkedin_url?: string;
  image_url: string;
  order_index: number;
}

const Team = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("team_profiles")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching team members:", error);
    } else {
      setTeamMembers(data || []);
    }
    setLoading(false);
  };

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div
      onClick={() => setSelectedMember(member)}
      className="group cursor-pointer bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/50"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={member.image_url}
          alt={member.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm md:text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {member.name}
        </h3>
        <p className="text-xs text-primary font-medium line-clamp-2">{member.role}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-foreground">Our</span> <span className="text-gradient">Team</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Meet the passionate individuals behind IRTIQA, dedicated to advancing research culture
                and creating opportunities for medical students across Pakistan.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="py-20 text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">👥</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">Team Profiles Updating</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We're putting the finishing touches on our team profiles. Check back soon to meet the passionate individuals behind IRTIQA!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {teamMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Join Our Team</h2>
              <p className="text-muted-foreground mb-8">
                We're always looking for passionate individuals who want to contribute to
                advancing research culture in medical education.
              </p>
              <a
                href="/contact"
                className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>
      </main>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedMember.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <img
                    src={selectedMember.image_url}
                    alt={selectedMember.name}
                    className="w-full sm:w-48 h-48 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-lg text-primary font-semibold mb-4">{selectedMember.role}</p>
                    <div className="space-y-3">
                      {selectedMember.email && (
                        <a
                          href={`mailto:${selectedMember.email}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{selectedMember.email}</span>
                        </a>
                      )}
                      {selectedMember.linkedin_url && (
                        <a
                          href={selectedMember.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm">LinkedIn Profile</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-foreground">About</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedMember.bio}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Team;
