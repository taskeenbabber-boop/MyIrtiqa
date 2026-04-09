import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Copy, CheckCircle2 } from "lucide-react";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");
  const [product, setProduct] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [copiedField, setCopiedField] = useState<string>("");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    if (!productId) {
      navigate("/programs");
      return;
    }

    loadProduct();
  }, [user, authLoading, productId, navigate]);

  const loadProduct = async () => {
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("slug", productId)
      .single();

    if (productError || !productData) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      });
      navigate("/programs");
      return;
    }

    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "bank_account_details")
      .single();

    setProduct(productData);
    setBankDetails(settingsData?.value || {});
    setLoading(false);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
  };

  const handleCheckout = async () => {
    if (!user || !product || !paymentProof) {
      toast({
        title: "Missing Information",
        description: "Please upload payment proof screenshot",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Upload payment proof
      const fileExt = paymentProof.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProof);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Create order
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          productId: product.id, 
          paymentProofUrl: publicUrl 
        },
      });

      if (error) throw error;

      toast({
        title: "Order Submitted!",
        description: "Your order is pending admin verification. You'll receive access once approved.",
      });

      navigate("/programs");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to submit order",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Purchase</CardTitle>
            <CardDescription>Choose your payment method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Summary */}
            <div className="bg-secondary rounded-lg p-6 space-y-2">
              <h3 className="font-heading font-semibold text-lg">{product.title}</h3>
              <p className="text-muted-foreground text-sm">{product.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-heading font-bold text-primary">
                  {product.currency} {product.price}
                </span>
              </div>
            </div>

            {/* Bank Account Details */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Bank Transfer Details</Label>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                {bankDetails?.bank_name && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{bankDetails.bank_name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(bankDetails.bank_name, "Bank Name")}
                    >
                      {copiedField === "Bank Name" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
                {bankDetails?.account_title && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Title</p>
                      <p className="font-medium">{bankDetails.account_title}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(bankDetails.account_title, "Account Title")}
                    >
                      {copiedField === "Account Title" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
                {bankDetails?.account_number && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="font-medium">{bankDetails.account_number}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(bankDetails.account_number, "Account Number")}
                    >
                      {copiedField === "Account Number" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
                {bankDetails?.iban && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">IBAN</p>
                      <p className="font-medium">{bankDetails.iban}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(bankDetails.iban, "IBAN")}
                    >
                      {copiedField === "IBAN" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Proof Upload */}
            <div className="space-y-4">
              <Label htmlFor="payment-proof" className="text-base font-semibold">
                Upload Payment Proof
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Input
                  id="payment-proof"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Label htmlFor="payment-proof" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {paymentProof ? (
                    <p className="text-sm font-medium">{paymentProof.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Click to upload payment screenshot</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, or WEBP (Max 5MB)
                      </p>
                    </>
                  )}
                </Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => navigate("/programs")} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCheckout} 
                disabled={processing || !paymentProof} 
                className="flex-1"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Order"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Your order will be verified by our team within 24 hours. You'll receive access once approved.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
