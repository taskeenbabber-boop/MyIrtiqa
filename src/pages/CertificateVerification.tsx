import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, Share2, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CertificateVerification = () => {
  const { code: urlCode } = useParams();
  const [verificationCode, setVerificationCode] = useState(urlCode || "");
  const [isSearching, setIsSearching] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (urlCode) {
      handleVerify(undefined, urlCode);
    }
  }, [urlCode]);

  const handleVerify = async (e?: React.FormEvent, code?: string) => {
    if (e) e.preventDefault();
    
    const searchCode = code || verificationCode;
    
    if (!searchCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a verification code",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("verify-certificate", {
        body: { code: searchCode },
      });

      if (error) throw error;

      if (data.success) {
        setCertificateData(data.certificate);
        toast({
          title: "Success",
          description: "Certificate found!",
        });
      } else {
        setCertificateData(null);
        toast({
          title: "Not Found",
          description: data.message || "Certificate not found",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setCertificateData(null);
      toast({
        title: "Error",
        description: "Failed to verify certificate",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/verify/${verificationCode}`;
    const text = `Verified certificate for ${certificateData?.courseTitle}`;
    
    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Copied",
          description: "Link copied to clipboard!",
        });
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-accent to-background py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-heading font-bold">
                Certificate <span className="text-gradient">Verification</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Verify the authenticity of IRTIQA certificates using the unique verification code
              </p>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-large">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-center">
                    Enter Verification Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="e.g., IRTIQA-2024-001234"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="pl-10 h-12 text-lg"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12"
                      disabled={isSearching}
                    >
                      {isSearching ? "Verifying..." : "Verify Certificate"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Certificate Display */}
        {certificateData && (
          <section className="py-20 bg-secondary">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                {/* Status Banner */}
                <Card className={`border-2 ${
                  certificateData.status === "valid" 
                    ? "border-green-500 bg-green-500/5" 
                    : "border-red-500 bg-red-500/5"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      {certificateData.status === "valid" ? (
                        <CheckCircle className="h-8 w-8 text-green-500 mr-4 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500 mr-4 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className="text-xl font-heading font-semibold">
                          {certificateData.status === "valid" 
                            ? "Certificate Verified" 
                            : "Certificate Revoked"}
                        </h3>
                        <p className="text-muted-foreground">
                          {certificateData.status === "valid"
                            ? "This is an authentic IRTIQA certificate"
                            : "This certificate is no longer valid"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Details */}
                <Card className="shadow-large">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Student Name</div>
                        <div className="text-lg font-semibold">{certificateData.studentName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Course</div>
                        <div className="text-lg font-semibold">{certificateData.courseTitle}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Issue Date</div>
                        <div className="text-lg font-semibold">
                          {new Date(certificateData.issueDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Verification Code</div>
                        <div className="text-lg font-semibold font-mono">{certificateData.verificationCode}</div>
                      </div>
                    </div>

                    {/* Certificate Preview */}
                    {certificateData.fileUrl && (
                      <div className="aspect-[1.414/1] bg-muted rounded-lg border-2 border-border mb-6 overflow-hidden">
                        <iframe 
                          src={certificateData.fileUrl}
                          className="w-full h-full"
                          title="Certificate Preview"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(certificateData.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.print()}
                      >
                        Print
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleShare('copy')}
                      >
                        Copy Link
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleShare('linkedin')}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    {/* Share to Specific Platforms */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-3">Share on:</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShare('linkedin')}
                        >
                          LinkedIn
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShare('twitter')}
                        >
                          Twitter / X
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShare('whatsapp')}
                        >
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-12 text-center">
                How Verification Works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-heading font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-heading font-semibold">Enter Code</h3>
                  <p className="text-muted-foreground">
                    Input the unique verification code found on your certificate
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-heading font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-heading font-semibold">Instant Verification</h3>
                  <p className="text-muted-foreground">
                    Our system instantly checks the code against our secure database
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-heading font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-heading font-semibold">View & Share</h3>
                  <p className="text-muted-foreground">
                    Access the certificate and share it on professional platforms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CertificateVerification;
