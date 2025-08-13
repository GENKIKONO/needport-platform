import Stripe from 'stripe';
import { getStripeServerConfig } from './stripe';
import { getSupabaseAdminConfig } from './supabase';

export interface StripeConnectConfig {
  isConfigured: boolean;
}

export function getStripeConnectConfig(): StripeConnectConfig {
  const stripeConfig = getStripeServerConfig();
  return {
    isConfigured: stripeConfig.isConfigured,
  };
}

export async function createConnectAccount(params: {
  profileId: string;
  email: string;
  country?: string;
}) {
  const config = getStripeServerConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Stripe not configured' };
  }

  try {
    const account = await config.client.accounts.create({
      type: 'standard',
      country: params.country || 'JP',
      email: params.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        profile_id: params.profileId,
      },
    });

    return { accountId: account.id };
  } catch (error) {
    console.error('Error creating Connect account:', error);
    return { error: 'Failed to create Connect account' };
  }
}

export async function createAccountLink(params: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
  type?: 'account_onboarding' | 'account_update';
}) {
  const config = getStripeServerConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Stripe not configured' };
  }

  try {
    const link = await config.client.accountLinks.create({
      account: params.accountId,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: params.type || 'account_onboarding',
    });

    return { url: link.url };
  } catch (error) {
    console.error('Error creating account link:', error);
    return { error: 'Failed to create account link' };
  }
}

export async function getConnectAccount(accountId: string) {
  const config = getStripeServerConfig();
  
  if (!config.isConfigured || !config.client) {
    return { error: 'Stripe not configured' };
  }

  try {
    const account = await config.client.accounts.retrieve(accountId);
    return { account };
  } catch (error) {
    console.error('Error retrieving Connect account:', error);
    return { error: 'Failed to retrieve Connect account' };
  }
}

export function isAccountComplete(account: Stripe.Account): boolean {
  // Check if all required fields are completed
  const requiredFields = [
    'business_type',
    'company.name',
    'company.address.line1',
    'company.address.city',
    'company.address.postal_code',
    'company.address.country',
    'representative.first_name',
    'representative.last_name',
    'representative.email',
    'representative.phone',
    'representative.address.line1',
    'representative.address.city',
    'representative.address.postal_code',
    'representative.address.country',
    'representative.dob.day',
    'representative.dob.month',
    'representative.dob.year',
  ];

  // Check if account is verified
  if (account.charges_enabled !== true || account.payouts_enabled !== true) {
    return false;
  }

  // Check if all required fields are filled
  for (const field of requiredFields) {
    const value = getNestedValue(account, field);
    if (!value) {
      return false;
    }
  }

  return true;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

export function getAccountStatus(account: Stripe.Account): {
  isComplete: boolean;
  isEnabled: boolean;
  missingFields: string[];
} {
  const isComplete = isAccountComplete(account);
  const isEnabled = account.charges_enabled === true && account.payouts_enabled === true;
  
  const missingFields: string[] = [];
  
  if (!account.charges_enabled) {
    missingFields.push('charges_enabled');
  }
  if (!account.payouts_enabled) {
    missingFields.push('payouts_enabled');
  }
  if (!account.details_submitted) {
    missingFields.push('details_submitted');
  }

  return {
    isComplete,
    isEnabled,
    missingFields,
  };
}
