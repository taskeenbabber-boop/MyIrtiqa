import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  content: string;
  photo_url: string | null;
  sort_order: number;
}

export function AnimatedTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    
    if (data) setTestimonials(data);
  };

  // Split testimonials into 3 rows for the animation effect
  const row1 = testimonials.slice(0, Math.ceil(testimonials.length / 3));
  const row2 = testimonials.slice(Math.ceil(testimonials.length / 3), Math.ceil((testimonials.length / 3) * 2));
  const row3 = testimonials.slice(Math.ceil((testimonials.length / 3) * 2));

  return (
    <section className="py-20 bg-secondary overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            What Our Students Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of satisfied learners who have transformed their research journey with IRTIQA
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1 - Scrolls left */}
        <div className="flex gap-6 animate-scroll-left">
          {[...row1, ...row1].map((testimonial, idx) => (
            <TestimonialCard key={`row1-${testimonial.id}-${idx}`} testimonial={testimonial} />
          ))}
        </div>

        {/* Row 2 - Scrolls right */}
        <div className="flex gap-6 animate-scroll-right">
          {[...row2, ...row2].map((testimonial, idx) => (
            <TestimonialCard key={`row2-${testimonial.id}-${idx}`} testimonial={testimonial} />
          ))}
        </div>

        {/* Row 3 - Scrolls left */}
        <div className="flex gap-6 animate-scroll-left">
          {[...row3, ...row3].map((testimonial, idx) => (
            <TestimonialCard key={`row3-${testimonial.id}-${idx}`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="flex-shrink-0 w-[400px] shadow-soft hover:shadow-medium transition-smooth">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={testimonial.photo_url || undefined} alt={testimonial.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(testimonial.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-semibold text-lg">{testimonial.name}</h4>
            <p className="text-sm text-muted-foreground">
              {testimonial.role}
              {testimonial.company && ` • ${testimonial.company}`}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {testimonial.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
