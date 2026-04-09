import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Linkedin, Twitter, Facebook, MapPin, Send, Phone } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - will be replaced with actual backend integration
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-accent to-background py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-heading font-bold">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions or want to collaborate? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">Send us a Message</h2>
              <Card className="shadow-large">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What's this about?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-heading font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <Card className="shadow-soft hover:shadow-medium transition-smooth">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold mb-2">Email</h3>
                          <a
                            href="mailto:info.irtiqa@gmail.com"
                            className="text-muted-foreground hover:text-primary transition-smooth"
                          >
                            info.irtiqa@gmail.com
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft hover:shadow-medium transition-smooth">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <Phone className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold mb-2">WhatsApp</h3>
                          <a
                            href="https://wa.link/lq1d1p"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-green-500 transition-smooth"
                          >
                            +1 (226) 350-6873
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft hover:shadow-medium transition-smooth">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold mb-2">Location</h3>
                          <p className="text-muted-foreground">
                            Serving learners globally
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-2xl font-heading font-bold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a
                    href="https://pk.linkedin.com/company/irtiqaresearch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="https://x.com/irtiqa_research"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/irtiqa_research"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Quick Info */}
              <Card className="shadow-soft bg-accent border-2 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold mb-3 text-lg">Business Inquiries</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Interested in partnerships, sponsorships, or corporate training programs?
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <a href="mailto:partnership@myirtiqa.com">
                      Contact Partnerships Team
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Redirect */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Looking for Answers?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Check out our frequently asked questions on the Programs page
            </p>
            <Button asChild variant="outline" size="lg">
              <a href="/programs#faq">View FAQs</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
