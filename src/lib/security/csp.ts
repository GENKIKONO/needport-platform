// Edge/Node 両対応の nonce 生成 + CSP ビルダー（開発時は unsafe-eval を許可）

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // @ts-ignore
  return btoa(bin);
}

export function makeNonce(size = 16): string {
  if (globalThis.crypto && "getRandomValues" in globalThis.crypto) {
    const b = new Uint8Array(size);
    globalThis.crypto.getRandomValues(b);
    return bytesToBase64(b);
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { randomBytes } = require("crypto");
  return randomBytes(size).toString("base64");
}

export function buildCSP(nonce: string) {
  const isDev = process.env.NODE_ENV !== "production";
  const isPreview = process.env.VERCEL_ENV === "preview";

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    isDev ? "'unsafe-eval'" : null, // dev のみ webpack の eval を許可
    isDev ? "ws:" : null,
    isDev ? "wss:" : null,
    isPreview ? "https://vercel.live" : null, // Preview環境でVercel Liveを許可
  ]
    .filter(Boolean)
    .join(" ");

  const connectSrc = [
    "'self'",
    isDev ? "ws:" : null,
    isDev ? "wss:" : null,
    isDev ? "http://localhost:3000" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https:",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src ${imgSrc}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
  ].join("; ");
}

interface CSPConfig {
  nonce: string;
  reportOnly?: boolean;
  reportUri?: string;
}

export function cspHeader(config: CSPConfig): string {
  const { nonce, reportOnly = false, reportUri } = config;
  const isPreview = process.env.VERCEL_ENV === "preview";
  
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    isPreview ? "https://vercel.live" : null, // Preview環境でVercel Liveを許可
  ].filter(Boolean).join(" ");
  
  const directives = [
    // Default source
    "default-src 'self'",
    
    // Scripts
    `script-src ${scriptSrc}`,
    
    // Styles
    "style-src 'self' 'unsafe-inline'",
    
    // Images
    "img-src 'self' data: https: *.supabase.co",
    
    // Fonts
    "font-src 'self' data:",
    
    // Connect (for API calls)
    "connect-src 'self' *.supabase.co",
    
    // Media
    "media-src 'self'",
    
    // Object (for plugins)
    "object-src 'none'",
    
    // Frame ancestors (prevent clickjacking)
    "frame-ancestors 'none'",
    
    // Base URI
    "base-uri 'self'",
    
    // Form action
    "form-action 'self'",
    
    // Frame source
    "frame-src 'self'",
    
    // Worker source
    "worker-src 'self' blob:",
    
    // Manifest source
    "manifest-src 'self'",
    
    // Upgrade insecure requests
    "upgrade-insecure-requests"
  ];

  // Add report URI if provided
  if (reportUri) {
    directives.push(`report-uri ${reportUri}`);
  }

  const cspString = directives.join("; ");

  return reportOnly ? `Content-Security-Policy-Report-Only: ${cspString}` : `Content-Security-Policy: ${cspString}`;
}

export function createCSPHeaders(config: CSPConfig): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Add CSP header
  const cspHeaderString = cspHeader(config);
  const [name, value] = cspHeaderString.split(": ", 2);
  headers[name] = value;
  
  // Add additional security headers
  headers["X-Content-Type-Options"] = "nosniff";
  headers["X-Frame-Options"] = "DENY";
  headers["X-XSS-Protection"] = "1; mode=block";
  headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
  
  return headers;
}

// Helper function to validate nonce
export function validateNonce(nonce: string): boolean {
  if (!nonce || typeof nonce !== "string") {
    return false;
  }
  
  // Check if nonce is valid base64
  try {
    const decoded = Buffer.from(nonce, "base64");
    return decoded.length === 16; // 16 bytes = 128 bits
  } catch {
    return false;
  }
}

// CSP violation reporting endpoint helper
export function createCSPReportHandler() {
  return async (request: Request) => {
    try {
      const report = await request.json();
      console.error("CSP Violation:", JSON.stringify(report, null, 2));
      
      // In production, you might want to log this to a monitoring service
      // or send it to your error tracking system
      
      return new Response("OK", { status: 204 });
    } catch (error) {
      console.error("Error processing CSP report:", error);
      return new Response("Bad Request", { status: 400 });
    }
  };
}
