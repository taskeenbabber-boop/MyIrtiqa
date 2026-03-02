import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [settings, setSettings] = useState({
    loaderStyle: "orbit" as "orbit" | "sweep" | "off",
    primaryColor: "#1247FF",
    heroCtaText: "Get the 15-Day Series",
    contactEmail: "contact@irtiqa.com",
    socialLinkedin: "",
    socialTwitter: "",
    socialFacebook: "",
    footerMission: "Empowering researchers through quality training",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "loader_style",
          "primary_color",
          "hero_cta_text",
          "contact_email",
          "social_linkedin",
          "social_twitter",
          "social_facebook",
          "footer_mission",
        ]);

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {} as Record<string, any>);

        setSettings({
          loaderStyle: settingsMap.loader_style || "orbit",
          primaryColor: settingsMap.primary_color || "#1247FF",
          heroCtaText: settingsMap.hero_cta_text || "Get the 15-Day Series",
          contactEmail: settingsMap.contact_email || "contact@irtiqa.com",
          socialLinkedin: settingsMap.social_linkedin || "",
          socialTwitter: settingsMap.social_twitter || "",
          socialFacebook: settingsMap.social_facebook || "",
          footerMission: settingsMap.footer_mission || "Empowering researchers through quality training",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: "loader_style", value: settings.loaderStyle },
        { key: "primary_color", value: settings.primaryColor },
        { key: "hero_cta_text", value: settings.heroCtaText },
        { key: "contact_email", value: settings.contactEmail },
        { key: "social_linkedin", value: settings.socialLinkedin },
        { key: "social_twitter", value: settings.socialTwitter },
        { key: "social_facebook", value: settings.socialFacebook },
        { key: "footer_mission", value: settings.footerMission },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({ key: update.key, value: update.value });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Site Settings</h1>
        <p className="text-muted-foreground">Manage your site configuration and branding</p>
      </div>

      <div className="space-y-6">
        {/* Loader Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Loader Animation</CardTitle>
            <CardDescription>Choose the loading animation style</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="loaderStyle">Loader Style</Label>
              <Select
                value={settings.loaderStyle}
                onValueChange={(value: "orbit" | "sweep" | "off") =>
                  setSettings({ ...settings, loaderStyle: value })
                }
              >
                <SelectTrigger id="loaderStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orbit">Dot Orbit</SelectItem>
                  <SelectItem value="sweep">Progress Sweep</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Brand Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Settings</CardTitle>
            <CardDescription>Customize your brand colors and text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  placeholder="#1247FF"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroCtaText">Hero CTA Text</Label>
              <Input
                id="heroCtaText"
                value={settings.heroCtaText}
                onChange={(e) => setSettings({ ...settings, heroCtaText: e.target.value })}
                placeholder="Get the 15-Day Series"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="contact@irtiqa.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Update your social media profile URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="socialLinkedin">LinkedIn URL</Label>
              <Input
                id="socialLinkedin"
                value={settings.socialLinkedin}
                onChange={(e) => setSettings({ ...settings, socialLinkedin: e.target.value })}
                placeholder="https://linkedin.com/company/irtiqa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialTwitter">Twitter/X URL</Label>
              <Input
                id="socialTwitter"
                value={settings.socialTwitter}
                onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                placeholder="https://twitter.com/irtiqa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialFacebook">Facebook URL</Label>
              <Input
                id="socialFacebook"
                value={settings.socialFacebook}
                onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                placeholder="https://facebook.com/irtiqa"
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Footer Settings</CardTitle>
            <CardDescription>Customize footer content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="footerMission">Mission Statement</Label>
              <Textarea
                id="footerMission"
                value={settings.footerMission}
                onChange={(e) => setSettings({ ...settings, footerMission: e.target.value })}
                placeholder="Empowering researchers through quality training"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
