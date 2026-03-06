import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Play, Download, Clock, Users, Award, ArrowRight } from "lucide-react";

const Programs = () => {
  const features = [
    "15 comprehensive video sessions covering research fundamentals",
    "Downloadable templates and resources for each module",
    "Lifetime access to all course materials",
    "Step-by-step guidance and practical Research Skills",
    "Research methodology best practices",
    "Academic writing techniques and standards",
    "Certificate of completion",
  ];

  const curriculum = [
    { day: 1, title: "Microsoft Word for Formatting Research Papers", topics: ["Importance of MS Word in Research", "Proper Formatting of Research Papers", "In-Depth MS Word Tutorial"] },
    { day: 2, title: "Microsoft Excel for Data Entry & Cleaning", topics: ["Understanding Excel Interface", "Data Entry Basics", "Data Cleaning Techniques"] },
    { day: 3, title: "PowerPoint & Canva for Poster/Slide Design", topics: ["Principles of Visual Communication", "Creating Professional Posters", "Slide Design Best Practices"] },
    { day: 4, title: "Zotero / Mendeley for Reference Management", topics: ["Installing Reference Managers", "Adding References", "Citation Styles & Bibliography"] },
    { day: 5, title: "Google Scholar & PubMed for Literature Search", topics: ["Effective Search Strategies", "Boolean Operators", "Filtering & Exporting Results"] },
    { day: 6, title: "AI Tools (ChatGPT, Elicit, Scite.ai etc.)", topics: ["Introduction to AI in Research", "Using ChatGPT for Research", "Elicit & Scite.ai for Literature Review"] },
    { day: 7, title: "SPSS layout and functionalities", topics: ["SPSS Interface Overview", "Data Entry in SPSS", "Basic Statistical Functions"] },
    { day: 8, title: "Mastering the Art of Data Analysis", topics: ["Descriptive Statistics", "Inferential Statistics", "Interpreting Results"] },
    { day: 9, title: "Crafting A Comprehensive Research Proposal", topics: ["Research Problem Identification", "Literature Review", "Methodology Design"] },
    { day: 10, title: "Research Essentials Getting Started (ABC of Research)", topics: ["What is Research?", "Types of Research", "Research Ethics Basics"] },
    { day: 11, title: "Developing, Validating & Administering A Research Questionnaire", topics: ["Questionnaire Design", "Validation Methods", "Survey Administration"] },
    { day: 12, title: "Research Ethics & Plagiarism", topics: ["Ethical Guidelines", "Avoiding Plagiarism", "IRB Approval Process"] },
    { day: 13, title: "Manuscript Writing for Publication", topics: ["Journal Article Structure", "Writing Tips", "Common Mistakes to Avoid"] },
    { day: 14, title: "The Art of Research Presentation and Defense", topics: ["Presentation Skills", "Handling Questions", "Defense Strategies"] },
    { day: 15, title: "Strategies for Journal Selection & Research Publishing", topics: ["Choosing the Right Journal", "Submission Process", "Dealing with Peer Review"] },
  ];

  const faqs = [
    {
      question: "Who is this program for?",
      answer: "This program is designed for students, early-career researchers, healthcare professionals, and anyone interested in learning research methodology from the ground up. No prior research experience is required.",
    },
    {
      question: "How long do I have access to the content?",
      answer: "You get lifetime access to all course materials, including any future updates and additions to the program.",
    },
    {
      question: "Will I receive a certificate?",
      answer: "Yes! Upon completion of the 15-day series, you'll receive a verified certificate that you can share on LinkedIn and other professional platforms.",
    },
    {
      question: "What's your refund policy?",
      answer: "We offer a 7-day money-back guarantee. If you're not satisfied with the program within the first week, we'll provide a full refund, no questions asked.",
    },
    {
      question: "Do I need any special software?",
      answer: "No special software is required. You'll need a web browser to access the video content and a PDF reader for the downloadable resources.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 pt-16">

        {/* ═══════════ AI SYMPOSIUM FEATURED EVENT (FIRST) ═══════════ */}
        <section className="py-20 bg-gradient-to-b from-background to-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center bg-blue-500/10 text-blue-500 rounded-full px-4 py-2 text-sm font-semibold mb-4">
                  🔥 Upcoming Event
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
                  AI Symposium <span className="text-gradient">2026</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  A landmark two-day event exploring the intersection of Artificial Intelligence and Healthcare — featuring workshops, keynotes, panel discussions, and exciting competitions.
                </p>
              </div>

              <Card className="overflow-hidden bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20 shadow-xl hover:shadow-2xl transition-shadow">
                <CardContent className="p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">Workshops</span>
                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-semibold">Keynotes</span>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">Competitions</span>
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">Panels</span>
                      </div>
                      <div className="space-y-3 text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>April 10–11, 2026 — Two full days</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>Industry experts, researchers & professionals</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>Verifiable digital certificates for all participants</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-4 text-center md:text-right">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Starting from</div>
                        <div className="text-5xl font-heading font-bold text-primary">Rs. 500</div>
                        <div className="text-sm text-muted-foreground mt-1">NWSM Student Conference Pass</div>
                      </div>
                      <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                        <Link to="/ai-symposium">
                          Explore AI Symposium <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ═══════════ HERO — 15 Day Series ═══════════ */}
        <section className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center bg-primary-light/20 rounded-full px-4 py-2 text-sm font-medium mb-4">
                <Award className="h-4 w-4 mr-2" />
                Most Popular Program
              </div>
              <h1 className="text-5xl md:text-6xl font-heading font-bold">
                15-Day Roots of Research
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Master research fundamentals through comprehensive video training designed by expert researchers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="shadow-large hover:shadow-glow transition-smooth"
                >
                  <Link to="/checkout?product=15-day-roots-of-research">
                    Purchase Now - PKR 500 <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div className="space-y-2">
                <Clock className="h-8 w-8 text-primary mx-auto" />
                <div className="text-2xl font-heading font-bold">15 Days</div>
                <div className="text-sm text-muted-foreground">Structured Learning</div>
              </div>
              <div className="space-y-2">
                <Play className="h-8 w-8 text-primary mx-auto" />
                <div className="text-2xl font-heading font-bold">30+ Hours</div>
                <div className="text-sm text-muted-foreground">Video Content</div>
              </div>
              <div className="space-y-2">
                <Download className="h-8 w-8 text-primary mx-auto" />
                <div className="text-2xl font-heading font-bold">30+</div>
                <div className="text-sm text-muted-foreground">Resources</div>
              </div>
              <div className="space-y-2">
                <Users className="h-8 w-8 text-primary mx-auto" />
                <div className="text-2xl font-heading font-bold">550+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-12 text-center">
                What's Included
              </h2>
              <Card className="shadow-large">
                <CardContent className="p-8 md:p-12">
                  <ul className="space-y-4">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-primary mr-4 flex-shrink-0 mt-0.5" />
                        <span className="text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-12 text-center">
                Full Curriculum
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {curriculum.map((day) => (
                  <AccordionItem
                    key={day.day}
                    value={`day-${day.day}`}
                    className="bg-card rounded-lg shadow-soft hover:shadow-medium transition-smooth border px-6"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center text-left">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="font-heading font-bold text-primary">{day.day}</span>
                        </div>
                        <div>
                          <div className="font-heading font-semibold text-lg">{day.title}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <ul className="ml-16 space-y-2">
                        {day.topics.map((topic, index) => (
                          <li key={index} className="flex items-center text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Sample Preview */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8">
                Preview Sample Content
              </h2>
              <Card className="shadow-large overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Play className="h-16 w-16 text-primary mx-auto" />
                      <p className="text-muted-foreground">Sample video preview coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-12 text-center">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="bg-card rounded-lg shadow-soft hover:shadow-medium transition-smooth border px-6"
                  >
                    <AccordionTrigger className="hover:no-underline py-4 text-left">
                      <span className="font-heading font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Purchase CTA */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-glow">
                <CardContent className="p-12 text-center space-y-6">
                  <h2 className="text-4xl font-heading font-bold text-foreground">
                    Ready to Start Learning?
                  </h2>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">One-time payment</div>
                    <div className="text-6xl font-heading font-bold text-primary">PKR 500</div>
                    <div className="text-sm text-muted-foreground">Lifetime access • Certificate included</div>
                  </div>
                  <Button asChild size="lg" className="shadow-medium hover:shadow-large transition-smooth">
                    <Link to="/checkout?product=15-day-roots-of-research">
                      Purchase Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    7-day money-back guarantee • Instant access upon purchase
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Programs;
