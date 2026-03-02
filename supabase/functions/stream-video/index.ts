import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Expose-Headers": "content-length, content-range, accept-ranges",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get file ID from query params
    const url = new URL(req.url);
    const fileId = url.searchParams.get("id");
    
    if (!fileId) {
      throw new Error("File ID is required");
    }

    console.log("Stream request for file:", fileId, "user:", user.id);

    // Verify user owns the product associated with this video
    const { data: libraryItem } = await supabase
      .from("library_items")
      .select("product_id, title")
      .eq("video_ref", fileId)
      .single();

    if (!libraryItem) {
      throw new Error("Video not found");
    }

    // Check if user has purchased the product
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", libraryItem.product_id)
      .eq("status", "paid");

    if (!orders || orders.length === 0) {
      throw new Error("Access denied: Product not purchased");
    }

    // Get Drive service account credentials
    const driveServiceJson = Deno.env.get("DRIVE_SERVICE_JSON");
    if (!driveServiceJson) {
      throw new Error("Drive service account not configured");
    }

    const credentials = JSON.parse(driveServiceJson);

    // Generate JWT for Google API authentication
    const jwt = await generateJWT(credentials);

    // Get file metadata from Drive
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType,size`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      throw new Error("Failed to fetch file metadata");
    }

    const metadata = await metadataResponse.json();

    // Handle range requests for video seeking
    const rangeHeader = req.headers.get("range");
    let start = 0;
    let end = parseInt(metadata.size) - 1;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : end;
    }

    // Stream the file from Google Drive
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          Range: `bytes=${start}-${end}`,
        },
      }
    );

    if (!driveResponse.ok) {
      throw new Error("Failed to fetch file from Drive");
    }

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set("Content-Type", metadata.mimeType || "video/mp4");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Content-Length", `${end - start + 1}`);
    
    if (rangeHeader) {
      responseHeaders.set("Content-Range", `bytes ${start}-${end}/${metadata.size}`);
    }

    // Add watermark info in custom header (can be used by client)
    responseHeaders.set("X-User-Email", user.email || "");
    responseHeaders.set("X-Timestamp", new Date().toISOString());

    console.log("Streaming video:", metadata.name, "to user:", user.email);

    return new Response(driveResponse.body, {
      status: rangeHeader ? 206 : 200,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error("Error in stream-video:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.message.includes("Access denied") ? 403 : 400,
      }
    );
  }
});

async function generateJWT(credentials: any): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signatureInput = `${headerBase64}.${payloadBase64}`;

  // Import private key
  const privateKey = credentials.private_key;
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey.substring(
    pemHeader.length,
    privateKey.length - pemFooter.length
  ).replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    encoder.encode(signatureInput)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signatureInput}.${signatureBase64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}
