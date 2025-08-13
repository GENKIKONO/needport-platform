import { createAdminClient } from "@/lib/supabase/admin";

// ENV fallback mapping
const ENV_FALLBACKS: Record<string, string> = {
  'site_url': process.env.NEXT_PUBLIC_SITE_URL || '',
  'notifications_enabled': process.env.FF_NOTIFICATIONS || 'false',
  'notify_to': process.env.NP_NOTIFY_TO || '',
  'notify_bcc': process.env.NP_NOTIFY_BCC || '',
  'email_mask_pii': process.env.NP_EMAIL_MASK_PII || 'true',
  'stripe_enabled': process.env.NEXT_PUBLIC_STRIPE_ENABLED || 'false',
  'pwa_enabled': process.env.NEXT_PUBLIC_PWA_ENABLED || 'false',
  'rls_enforce': process.env.FF_RLS_ENFORCE || 'false',
};

export async function getSetting(key: string, fallback?: string): Promise<string | undefined> {
  try {
    const admin = createAdminClient();
    
    // Try to get from database first
    const { data: setting } = await admin
      .from("settings")
      .select("value")
      .eq("key", key)
      .single();
    
    if (setting?.value !== undefined) {
      return setting.value;
    }
    
    // Fall back to ENV
    if (ENV_FALLBACKS[key] !== undefined) {
      return ENV_FALLBACKS[key];
    }
    
    // Final fallback
    return fallback;
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error);
    
    // Try ENV fallback even if DB fails
    if (ENV_FALLBACKS[key] !== undefined) {
      return ENV_FALLBACKS[key];
    }
    
    return fallback;
  }
}

export async function setSettings(entries: Record<string, string>): Promise<void> {
  try {
    const admin = createAdminClient();
    
    // Validate keys (whitelist)
    const validKeys = Object.keys(ENV_FALLBACKS);
    const validEntries = Object.entries(entries).filter(([key]) => validKeys.includes(key));
    
    if (validEntries.length === 0) {
      throw new Error("No valid settings to update");
    }
    
    // Upsert settings
    const { error } = await admin
      .from("settings")
      .upsert(
        validEntries.map(([key, value]) => ({
          key,
          value,
          updated_at: new Date().toISOString(),
        }))
      );
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to set settings:", error);
    throw error;
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings: Record<string, string> = {};
  
  // Get all settings from database and ENV
  for (const key of Object.keys(ENV_FALLBACKS)) {
    settings[key] = await getSetting(key) || '';
  }
  
  return settings;
}

export async function getBool(key: string, defaultBool: boolean = false): Promise<boolean> {
  const value = await getSetting(key);
  if (!value) return defaultBool;
  
  // Coerce string to boolean
  return value === 'true' || value === '1' || value === 'yes';
}
