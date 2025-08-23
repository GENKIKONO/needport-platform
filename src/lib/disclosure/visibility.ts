import { createAdminClient } from '@/lib/supabase/admin';

export interface DisclosureLevel {
  showFullBody: boolean;
  showContactInfo: boolean;
  showFullProfile: boolean;
  showCompanyInfo: boolean;
}

/**
 * Determine disclosure level for a need based on user's payment status
 */
export async function getNeedDisclosureLevel(
  needId: string, 
  viewerUserId?: string
): Promise<DisclosureLevel> {
  // Default: show summary only
  const defaultLevel: DisclosureLevel = {
    showFullBody: false,
    showContactInfo: false,
    showFullProfile: false,
    showCompanyInfo: false,
  };

  if (!viewerUserId) {
    return defaultLevel;
  }

  const admin = createAdminClient();

  try {
    // Check if viewer has paid for this need
    const { data: paidMatches, error } = await admin
      .from('matches')
      .select('id, status, payment_id')
      .eq('need_id', needId)
      .eq('business_id', viewerUserId)
      .eq('status', 'paid')
      .limit(1);

    if (error) {
      console.error('Error checking paid matches:', error);
      return defaultLevel;
    }

    const hasPaidAccess = paidMatches && paidMatches.length > 0;

    if (hasPaidAccess) {
      return {
        showFullBody: true,
        showContactInfo: true,
        showFullProfile: true,
        showCompanyInfo: true,
      };
    }

    return defaultLevel;

  } catch (error) {
    console.error('Error determining disclosure level:', error);
    return defaultLevel;
  }
}

/**
 * Determine disclosure level for room participants
 */
export async function getRoomDisclosureLevel(
  roomId: string,
  viewerUserId?: string
): Promise<DisclosureLevel> {
  const defaultLevel: DisclosureLevel = {
    showFullBody: false,
    showContactInfo: false,
    showFullProfile: false,
    showCompanyInfo: false,
  };

  if (!viewerUserId) {
    return defaultLevel;
  }

  const admin = createAdminClient();

  try {
    // Get room and associated need
    const { data: room, error: roomError } = await admin
      .from('rooms')
      .select('need_id')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      console.error('Error fetching room:', roomError);
      return defaultLevel;
    }

    // Check if there are any paid matches for this need
    const { data: paidMatches, error: matchError } = await admin
      .from('matches')
      .select('id, business_id, status')
      .eq('need_id', room.need_id)
      .eq('status', 'paid');

    if (matchError) {
      console.error('Error checking paid matches for room:', matchError);
      return defaultLevel;
    }

    const hasPaidMatches = paidMatches && paidMatches.length > 0;

    if (hasPaidMatches) {
      return {
        showFullBody: true,
        showContactInfo: true,
        showFullProfile: true,
        showCompanyInfo: true,
      };
    }

    return defaultLevel;

  } catch (error) {
    console.error('Error determining room disclosure level:', error);
    return defaultLevel;
  }
}

/**
 * Mask sensitive information based on disclosure level
 */
export function maskContent(content: string, showFull: boolean): string {
  if (showFull) {
    return content;
  }

  // Mask email addresses
  const maskedEmail = content.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    '[お支払い後に表示]'
  );

  // Mask phone numbers
  const maskedPhone = maskedEmail.replace(
    /\b0\d{1,4}[-(]?\d{1,4}[-)]?\d{3,4}\b/g,
    '[お支払い後に表示]'
  );

  // Mask URLs
  const maskedUrls = maskedPhone.replace(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
    '[お支払い後に表示]'
  );

  return maskedUrls;
}

/**
 * Create masked version of need for public display
 */
export function createMaskedNeed(need: any, disclosureLevel: DisclosureLevel) {
  return {
    ...need,
    body: disclosureLevel.showFullBody ? need.body : maskContent(need.body || '', false),
    summary: need.summary, // Summary is always shown
    title: need.title, // Title is always shown
    tags: need.tags, // Tags are always shown
    area: need.area, // Area is always shown
    // Hide sensitive fields if not disclosed
    contact_info: disclosureLevel.showContactInfo ? need.contact_info : null,
    company_info: disclosureLevel.showCompanyInfo ? need.company_info : null,
  };
}

/**
 * Create masked version of user profile for room display
 */
export function createMaskedProfile(profile: any, disclosureLevel: DisclosureLevel) {
  if (disclosureLevel.showFullProfile) {
    return profile;
  }

  return {
    ...profile,
    name: profile.name ? profile.name.charAt(0) + '***' : '匿名ユーザー',
    company: disclosureLevel.showCompanyInfo ? profile.company : '企業名非公開',
    email: null,
    phone: null,
  };
}
