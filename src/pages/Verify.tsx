import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, Share2, CheckCircle, XCircle, Linkedin, Twitter, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

const Verify = () => {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState(urlCode || "");
  const [isSearching, setIsSearching] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (urlCode) {
      handleVerify(undefined, urlCode);
    }
  }, [urlCode]);

  // QR Scanner logic
  const startScanner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScannerOpen(true);

      // Wait for video element to be in DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          startDetecting();
        }
      }, 300);
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScannerOpen(false);
  }, []);

  const startDetecting = useCallback(() => {
    // Use BarcodeDetector if available (Chrome, Edge), else fall back to canvas-based URL matching
    if ("BarcodeDetector" in window) {
      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      scanIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            handleScannedValue(rawValue);
          }
        } catch { }
      }, 500);
    } else {
      // Fallback: use canvas to take snapshots and look for URLs
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      scanIntervalRef.current = window.setInterval(() => {
        if (!videoRef.current || videoRef.current.readyState < 2 || !ctx) return;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        // Without BarcodeDetector, we can't decode QR codes in-browser without a library
        // Show a toast suggesting manual entry
      }, 2000);

      // Inform user about limited support
      toast({
        title: "Limited QR Support",
        description: "Your browser doesn't support native QR scanning. Try Chrome or Edge, or enter the code manually.",
      });
    }
  }, []);

  const handleScannedValue = useCallback((value: string) => {
    stopScanner();
    // Try to extract verification code from URL (e.g., .../verify/IRTIQA-2024-001234)
    const urlMatch = value.match(/\/verify\/([A-Za-z0-9-]+)/);
    if (urlMatch) {
      navigate(`/verify/${urlMatch[1]}`, { replace: true });
      handleVerify(undefined, urlMatch[1]);
    } else {
      // Treat the whole scanned value as the code
      setVerificationCode(value);
      handleVerify(undefined, value);
    }
    toast({ title: "QR Code Scanned!", description: "Verifying certificate..." });
  }, []);

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
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .ilike("verification_code", searchCode.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCertificateData(data);
        if (!urlCode) {
          navigate(`/verify/${data.verification_code}`, { replace: true });
        }
        toast({
          title: "Success",
          description: "Certificate found!",
        });
      } else {
        setCertificateData(null);
        toast({
          title: "Not Found",
          description: "No certificate found with this code",
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

  const shareUrl = certificateData
    ? `${window.location.origin}/verify/${certificateData.verification_code}`
    : "";

  const handleShare = (platform: string) => {
    const text = `Verified certificate for ${certificateData?.course_title}`;

    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Copied",
          description: "Link copied to clipboard!",
        });
        break;
    }
  };

  return (
    <>
      {certificateData && (
        <Helmet>
          <title>Certificate Verification - {certificateData.student_name} - IRTIQA</title>
          <meta property="og:title" content={`${certificateData.student_name} - ${certificateData.course_title}`} />
          <meta property="og:description" content={`Verified IRTIQA certificate issued on ${new Date(certificateData.issue_date).toLocaleDateString()}`} />
          <meta property="og:url" content={shareUrl} />
          <meta property="og:type" content="website" />
        </Helmet>
      )}

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-accent to-background py-24 pt-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-heading font-bold">
                <span className="text-foreground">Certificate</span> <span className="text-gradient">Verification</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Verify the authenticity of IRTIQA certificates instantly
              </p>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12 -mt-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-large border-2">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-center">
                    Enter Verification Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter code (e.g., IRTIQA-2024-001234)"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="pl-12 h-14 text-lg rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        type="submit"
                        className="h-12 rounded-xl text-lg shadow-medium hover:shadow-large transition-smooth"
                        disabled={isSearching}
                      >
                        {isSearching ? "Verifying..." : "Verify Certificate"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-xl text-lg border-2"
                        onClick={startScanner}
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Scan QR Code
                      </Button>
                    </div>
                  </form>

                  {/* QR Scanner Modal Overlay */}
                  {scannerOpen && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                      <div className="relative w-full max-w-md aspect-square">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover rounded-2xl"
                          playsInline
                          muted
                        />
                        {/* Scanning frame corners */}
                        <div className="absolute inset-8 border-2 border-primary/30 rounded-2xl">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                          {/* Scanning line */}
                          <div
                            className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                            style={{ animation: "scanLine 2s ease-in-out infinite" }}
                          />
                        </div>
                      </div>
                      <p className="text-white/70 text-sm mt-4">Point your camera at the QR code on the certificate</p>
                      <Button
                        variant="outline"
                        className="mt-4 rounded-xl border-white/20 text-white hover:bg-white/10"
                        onClick={stopScanner}
                      >
                        <X className="h-4 w-4 mr-2" /> Close Scanner
                      </Button>
                      <style>{`
                        @keyframes scanLine {
                          0%, 100% { top: 8px; }
                          50% { top: calc(100% - 8px); }
                        }
                      `}</style>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Certificate Display */}
        {certificateData && (
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                {/* Status Banner */}
                <Card className={`border-2 rounded-2xl ${certificateData.status === "valid"
                  ? "border-success bg-success/5"
                  : "border-destructive bg-destructive/5"
                  }`}>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      {certificateData.status === "valid" ? (
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-success" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                          <XCircle className="h-6 w-6 text-destructive" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-heading font-bold mb-2">
                          {certificateData.status === "valid"
                            ? "✓ Certificate Verified"
                            : "Certificate Revoked"}
                        </h3>
                        <p className="text-muted-foreground">
                          {certificateData.status === "valid"
                            ? "This is an authentic IRTIQA certificate"
                            : "This certificate is no longer valid. Please contact support for assistance."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Details */}
                <Card className="shadow-large rounded-2xl border-2">
                  <CardContent className="p-8 md:p-12">
                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-10">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Student Name</div>
                        <div className="text-2xl font-heading font-bold">{certificateData.student_name}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Course</div>
                        <div className="text-2xl font-heading font-bold">{certificateData.course_title}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Issue Date</div>
                        <div className="text-xl font-semibold">
                          {new Date(certificateData.issue_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Verification Code</div>
                        <div className="text-xl font-mono font-semibold bg-muted px-4 py-2 rounded-lg inline-block">
                          {certificateData.verification_code}
                        </div>
                      </div>
                    </div>

                    {/* Certificate Preview */}
                    {certificateData.file_url && (
                      <div className="aspect-[1.414/1] bg-muted/30 rounded-2xl border-2 border-border mb-8 overflow-hidden">
                        <iframe
                          src={certificateData.file_url}
                          className="w-full h-full"
                          title="Certificate Preview"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                          variant="default"
                          size="lg"
                          className="w-full rounded-xl shadow-medium hover:shadow-large transition-smooth"
                          onClick={() => window.open(certificateData.file_url, '_blank')}
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download Certificate
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full rounded-xl border-2"
                          onClick={() => handleShare('copy')}
                        >
                          <Share2 className="h-5 w-5 mr-2" />
                          Copy Link
                        </Button>
                      </div>

                      {/* Share Options */}
                      <div className="pt-6 border-t border-border">
                        <p className="text-sm font-medium text-muted-foreground mb-4">Share on:</p>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            size="lg"
                            variant="outline"
                            className="rounded-xl border-2"
                            onClick={() => handleShare('linkedin')}
                          >
                            <Linkedin className="h-5 w-5 mr-2" />
                            LinkedIn
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="rounded-xl border-2"
                            onClick={() => handleShare('twitter')}
                          >
                            <Twitter className="h-5 w-5 mr-2" />
                            Twitter / X
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="rounded-xl border-2"
                            onClick={() => handleShare('whatsapp')}
                          >
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-16 text-center">
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-medium">
                    <span className="text-3xl font-heading font-bold text-primary-foreground">1</span>
                  </div>
                  <h3 className="text-xl font-heading font-bold">Enter Code</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Input the unique verification code found on your certificate
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-medium">
                    <span className="text-3xl font-heading font-bold text-primary-foreground">2</span>
                  </div>
                  <h3 className="text-xl font-heading font-bold">Instant Check</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our system instantly verifies against our secure database
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-medium">
                    <span className="text-3xl font-heading font-bold text-primary-foreground">3</span>
                  </div>
                  <h3 className="text-xl font-heading font-bold">View & Share</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Download, print, or share on professional networks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Verify;