#!/usr/bin/env ts-node

/**
 * Clerk Live Environment Configuration Verification
 * 
 * Verifies that all required Clerk Live settings are properly configured:
 * 1. OAuth Applications (Google)
 * 2. Domains (needport.jp)
 * 3. Allowed Origins
 * 4. Environment Variables (Live keys)
 * 
 * Exit codes:
 * 0 = All configurations valid
 * 1 = One or more configurations missing/invalid
 */

interface ClerkInstance {
  id: string;
  environment_type: string;
  allowed_origins: string[] | null;
}

interface OAuthApplication {
  object: string;
  id: string;
  name: string;
  enabled: boolean;
  scope: string;
  client_id: string;
}

interface ClerkDomain {
  id: string;
  name: string;
  is_primary: boolean;
  is_satellite: boolean;
}

class ClerkConfigVerifier {
  private secretKey: string;
  private publishableKey: string;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.secretKey = process.env.CLERK_SECRET_KEY || '';
    this.publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  }

  private maskKey(key: string): string {
    if (!key) return 'NOT_SET';
    const prefix = key.substring(0, 12);
    const suffix = key.substring(key.length - 6);
    return `${prefix}${'*'.repeat(20)}${suffix}`;
  }

  private async clerkApi(endpoint: string): Promise<any> {
    const url = `https://api.clerk.com/v1${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Clerk API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private verifyEnvironmentVariables(): boolean {
    console.log('🔍 Verifying environment variables...');
    
    let valid = true;

    // Check CLERK_SECRET_KEY
    if (!this.secretKey) {
      this.errors.push('CLERK_SECRET_KEY is not set');
      valid = false;
    } else if (!this.secretKey.startsWith('sk_live_')) {
      this.errors.push('CLERK_SECRET_KEY is not a live key (should start with sk_live_)');
      valid = false;
    } else {
      console.log(`✅ CLERK_SECRET_KEY: ${this.maskKey(this.secretKey)}`);
    }

    // Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    if (!this.publishableKey) {
      this.errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
      valid = false;
    } else if (!this.publishableKey.startsWith('pk_live_')) {
      this.errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not a live key (should start with pk_live_)');
      valid = false;
    } else {
      console.log(`✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${this.maskKey(this.publishableKey)}`);
    }

    return valid;
  }

  private async verifyInstance(): Promise<boolean> {
    console.log('🔍 Verifying Clerk instance...');
    
    try {
      const instance: ClerkInstance = await this.clerkApi('/instance');
      
      console.log(`✅ Instance ID: ${instance.id}`);
      console.log(`✅ Environment: ${instance.environment_type}`);

      if (instance.environment_type !== 'production') {
        this.errors.push(`Instance environment is '${instance.environment_type}', expected 'production'`);
        return false;
      }

      // Check allowed origins
      const requiredOrigins = ['https://needport.jp'];
      if (!instance.allowed_origins || instance.allowed_origins.length === 0) {
        this.errors.push('No allowed origins configured');
        return false;
      }

      const hasRequiredOrigin = requiredOrigins.some(origin => 
        instance.allowed_origins?.includes(origin) || 
        instance.allowed_origins?.includes(`${origin}/*`)
      );

      if (!hasRequiredOrigin) {
        this.errors.push(`Required origins not found. Expected: ${requiredOrigins.join(', ')}`);
        this.warnings.push(`Current origins: ${instance.allowed_origins.join(', ')}`);
        return false;
      }

      console.log(`✅ Allowed origins: ${instance.allowed_origins.join(', ')}`);
      return true;

    } catch (error) {
      this.errors.push(`Failed to verify instance: ${error}`);
      return false;
    }
  }

  private async verifyOAuthApplications(): Promise<boolean> {
    console.log('🔍 Verifying OAuth applications...');
    
    try {
      const response = await this.clerkApi('/oauth_applications');
      const apps: OAuthApplication[] = response.data || [];

      console.log(`Found ${apps.length} OAuth applications`);

      if (apps.length === 0) {
        this.errors.push('No OAuth applications configured');
        return false;
      }

      // Check for Google OAuth
      const googleApp = apps.find(app => 
        app.name.toLowerCase().includes('google') || 
        app.scope.includes('openid') ||
        app.client_id.includes('googleusercontent.com')
      );

      if (!googleApp) {
        this.errors.push('Google OAuth application not found');
        return false;
      }

      if (!googleApp.enabled) {
        this.errors.push('Google OAuth application is disabled');
        return false;
      }

      console.log(`✅ Google OAuth: ${googleApp.name} (enabled: ${googleApp.enabled})`);
      return true;

    } catch (error) {
      this.errors.push(`Failed to verify OAuth applications: ${error}`);
      return false;
    }
  }

  private async verifyDomains(): Promise<boolean> {
    console.log('🔍 Verifying domains...');
    
    try {
      const response = await this.clerkApi('/domains');
      const domains: ClerkDomain[] = response.data || [];

      console.log(`Found ${domains.length} domains`);

      if (domains.length === 0) {
        this.errors.push('No domains configured');
        return false;
      }

      // Check for needport.jp
      const requiredDomain = 'needport.jp';
      const needportDomain = domains.find(domain => 
        domain.name === requiredDomain || 
        domain.name === `www.${requiredDomain}`
      );

      if (!needportDomain) {
        this.errors.push(`Required domain '${requiredDomain}' not found`);
        this.warnings.push(`Current domains: ${domains.map(d => d.name).join(', ')}`);
        return false;
      }

      console.log(`✅ Domain: ${needportDomain.name} (primary: ${needportDomain.is_primary})`);
      return true;

    } catch (error) {
      this.errors.push(`Failed to verify domains: ${error}`);
      return false;
    }
  }

  public async verify(): Promise<boolean> {
    console.log('🚀 Starting Clerk Live configuration verification...\n');

    const results = await Promise.all([
      this.verifyEnvironmentVariables(),
      this.verifyInstance(),
      this.verifyOAuthApplications(),
      this.verifyDomains()
    ]);

    const allValid = results.every(result => result);

    console.log('\n📊 Verification Summary:');
    console.log(`Environment Variables: ${results[0] ? '✅' : '❌'}`);
    console.log(`Instance Configuration: ${results[1] ? '✅' : '❌'}`);
    console.log(`OAuth Applications: ${results[2] ? '✅' : '❌'}`);
    console.log(`Domains: ${results[3] ? '✅' : '❌'}`);

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      console.log('\n🔧 Manual configuration required in Clerk Dashboard:');
      console.log('  1. Add Google OAuth application (Social connections)');
      console.log('  2. Add domain: needport.jp');
      console.log('  3. Set allowed origins: https://needport.jp, https://needport.jp/*');
      console.log('  4. Configure redirect URLs: /sign-in*, /sign-up*, /sso-callback*');
    } else {
      console.log('\n🎉 All Clerk Live configurations are valid!');
    }

    return allValid;
  }
}

// Execute verification
async function main() {
  const verifier = new ClerkConfigVerifier();
  
  try {
    const isValid = await verifier.verify();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}