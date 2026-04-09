import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LibraryItem {
  id: string;
  day_index: number;
  title: string;
  description: string;
  video_source: string;
  video_ref: string;
  duration: number;
}

export default function Library() {
  const { user, session, loading: authLoading } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      checkAccessAndLoadItems();
    }
  }, [user, authLoading, navigate]);

  const checkAccessAndLoadItems = async () => {
    if (!user) return;

    // Get the 15-day series product
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", "15-day-roots-of-research")
      .single();

    if (!product) {
      setLoading(false);
      return;
    }

    // Check if user has purchased this product
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "paid");

    if (!orders || orders.length === 0) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    setHasAccess(true);

    // Load library items
    const { data: libraryItems, error } = await supabase
      .from("library_items")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_published", true)
      .order("sort_order");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load library items",
        variant: "destructive",
      });
    } else {
      setItems(libraryItems || []);
    }

    setLoading(false);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              You need to purchase the 15-Day Roots of Research series to access this content.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button onClick={() => navigate("/programs")} className="w-full">
              View Programs
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold mb-4">Your Library</h1>
            <p className="text-muted-foreground">
              Access your purchased course materials and recordings
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-primary" />
                        {item.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {item.description}
                      </CardDescription>
                    </div>
                    {item.duration && (
                      <div className="text-sm text-muted-foreground ml-4">
                        {Math.floor(item.duration / 60)} min
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {item.video_source === "youtube" && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                      <iframe
                        src={`https://www.youtube.com/embed/${item.video_ref}`}
                        title={item.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {item.video_source === "drive" && session && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                      <video
                        controls
                        className="w-full h-full"
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        src={`https://rvfkmlhlsnoosugldscq.supabase.co/functions/v1/stream-video?id=${item.video_ref}`}
                        style={{ 
                          position: 'relative',
                        }}
                      >
                        <track kind="captions" />
                      </video>
                      <div className="text-xs text-muted-foreground mt-2 px-2">
                        🔒 Secure access • {user?.email}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {items.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    No content available yet. Check back soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
