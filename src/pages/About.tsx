import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, Award } from "lucide-react";

const About = () => {
  const milestones = [
    { year: "2024", title: "Idea & BTS", description: "The concept of IRTIQA was born, with behind-the-scenes planning and preparation for launch" },
    { year: "June 2025", title: "Official Foundation", description: "IRTIQA was officially founded with a mission to democratize research education" },
    { year: "July 2025", title: "First Cohort", description: "Successfully launched our flagship 15-Day Roots of Research Training program" },
    { year: "2025+", title: "Continued Growth", description: "Expanding our reach to empower more aspiring researchers across Pakistan and beyond" },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-accent to-background py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-heading font-bold">
                About <span className="text-gradient">IRTIQA</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Incubator for Research, Training, Innovation & Quality Advancement
              </p>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="shadow-soft hover:shadow-medium transition-smooth">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-semibold">Mission</h3>
                  <p className="text-muted-foreground">
                    To empower aspiring researchers and professionals with world-class training, mentorship, and resources that bridge the gap between theory and practice.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-smooth">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-semibold">Vision</h3>
                  <p className="text-muted-foreground">
                    To become the leading platform for accessible, high-quality research education, fostering a global community of skilled researchers and innovators.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-smooth">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-semibold">Values</h3>
                  <p className="text-muted-foreground">
                    Excellence, accessibility, integrity, innovation, and continuous learning form the foundation of everything we do at IRTIQA.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-center">Our Story</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p>
                  IRTIQA was born from a simple observation: quality research training should be accessible to everyone, not just those in elite institutions. Our founders, experienced researchers and educators, witnessed countless talented individuals struggle to develop research skills due to lack of structured guidance and mentorship.
                </p>
                <p>
                  We started with a question: What if we could create a learning environment that combines academic rigor with practical application, delivered in a way that's both affordable and accessible? This question led to the creation of our flagship 15-Day Roots of Research program.
                </p>
                <p>
                  Today, IRTIQA stands as a bridge between academic research and practical implementation, serving learners from diverse backgrounds and helping them develop the skills needed to contribute meaningfully to their fields.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-12 text-center">Our Journey</h2>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border md:left-1/2"></div>

                <div className="space-y-12">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center mb-4 md:justify-center">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-medium z-10">
                          <Award className="h-8 w-8 text-primary-foreground" />
                        </div>
                      </div>
                      <Card className={`shadow-soft hover:shadow-medium transition-smooth md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                        <CardContent className="p-6">
                          <div className="text-sm font-semibold text-primary mb-2">{milestone.year}</div>
                          <h3 className="text-xl font-heading font-semibold mb-2">{milestone.title}</h3>
                          <p className="text-muted-foreground">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advisory Note */}
        <section className="py-20 bg-accent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Expert Guidance</h2>
              <p className="text-lg text-muted-foreground">
                IRTIQA is supported by an advisory board of distinguished researchers and academic leaders who ensure our programs maintain the highest standards of quality and relevance. Their insights help us continuously evolve our curriculum to meet the changing needs of the research community.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
