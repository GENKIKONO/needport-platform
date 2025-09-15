#!/usr/bin/env ts-node

/**
 * Clerk Configuration Sync: Test → Live Environment
 * 
 * Automates the configuration transfer from Test environment to Live environment:
 * 1. Extracts OAuth applications from Test environment
 * 2. Replicates configuration in Live environment
 * 3. Updates domains and allowed origins
 * 4. Verifies configuration completion
 * 
 * Exit codes:
 * 0 = Sync completed successfully
 * 1 = Sync failed or validation error
 * 2 = Missing required environment variables
 */

interface OAuthApplication {
  object: string;
  id: string;
  name: string;
  enabled: boolean;
  scope: string;
  client_id: string;
  client_secret?: string;
}

interface ClerkDomain {
  id: string;
  name: string;
  is_primary: boolean;
  is_satellite: boolean;
}

interface ClerkInstance {
  id: string;
  environment_type: string;
  allowed_origins: string[] | null;
}

class ClerkConfigSyncer {
  private testSecretKey: string;
  private liveSecretKey: string;
  private targetDomain: string = 'needport.jp';
  private targetOrigins: string[] = ['https://needport.jp', 'https://needport.jp/*'];
  
  constructor() {
    this.testSecretKey = process.env.CLERK_SECRET_KEY_TEST || '';
    this.liveSecretKey = process.env.CLERK_SECRET_KEY || '';
    
    if (!this.testSecretKey || !this.liveSecretKey) {
      console.error('❌ Missing required environment variables:');
      console.error('  - CLERK_SECRET_KEY_TEST (for source configuration)');
      console.error('  - CLERK_SECRET_KEY (for live environment)');
      process.exit(2);
    }
  }

  private async clerkApi(endpoint: string, secretKey: string, method: string = 'GET', body?: any): Promise<any> {
    const url = `https://api.clerk.com/v1${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Clerk API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    return response.json();
  }

  private async getTestEnvironmentConfig(): Promise<{
    oauthApps: OAuthApplication[];
    domains: ClerkDomain[];
    instance: ClerkInstance;
  }> {
    console.log('🔍 Fetching Test environment configuration...');
    
    try {
      const [oauthResponse, domainsResponse, instanceResponse] = await Promise.all([
        this.clerkApi('/oauth_applications', this.testSecretKey),
        this.clerkApi('/domains', this.testSecretKey),
        this.clerkApi('/instance', this.testSecretKey)
      ]);

      const config = {
        oauthApps: oauthResponse.data || [],
        domains: domainsResponse.data || [],
        instance: instanceResponse
      };

      console.log(`✅ Found ${config.oauthApps.length} OAuth applications in Test`);
      console.log(`✅ Found ${config.domains.length} domains in Test`);
      console.log(`✅ Test instance: ${config.instance.environment_type}`);

      return config;
    } catch (error) {
      throw new Error(`Failed to fetch Test environment config: ${error}`);
    }
  }

  private async syncOAuthApplications(testApps: OAuthApplication[]): Promise<boolean> {
    console.log('🔄 Syncing OAuth applications to Live environment...');
    
    if (testApps.length === 0) {
      console.log('⚠️ No OAuth applications found in Test environment');
      return true;
    }

    try {
      // Get current Live OAuth apps
      const liveResponse = await this.clerkApi('/oauth_applications', this.liveSecretKey);
      const liveApps: OAuthApplication[] = liveResponse.data || [];

      console.log(`Found ${liveApps.length} existing OAuth applications in Live`);

      for (const testApp of testApps) {
        // Check if app already exists in Live
        const existingApp = liveApps.find(app => 
          app.name === testApp.name || 
          app.client_id === testApp.client_id
        );

        if (existingApp) {
          console.log(`⏭️ OAuth app '${testApp.name}' already exists in Live (${existingApp.id})`);
          
          // Update if needed
          if (!existingApp.enabled && testApp.enabled) {
            console.log(`🔄 Enabling OAuth app '${testApp.name}' in Live...`);
            await this.clerkApi(`/oauth_applications/${existingApp.id}`, this.liveSecretKey, 'PATCH', {
              enabled: true
            });
            console.log(`✅ Enabled OAuth app '${testApp.name}'`);
          }
          continue;
        }

        // Create new OAuth app in Live
        console.log(`➕ Creating OAuth app '${testApp.name}' in Live...`);
        
        const newAppData = {
          name: testApp.name,
          enabled: testApp.enabled,
          scope: testApp.scope,
          client_id: testApp.client_id,
          // Note: client_secret needs to be manually configured via Clerk Dashboard
        };

        try {
          const newApp = await this.clerkApi('/oauth_applications', this.liveSecretKey, 'POST', newAppData);
          console.log(`✅ Created OAuth app '${testApp.name}' (${newApp.id})`);
          console.log(`⚠️ Manual action required: Configure client_secret in Clerk Dashboard for app ${newApp.id}`);
        } catch (createError) {
          console.error(`❌ Failed to create OAuth app '${testApp.name}': ${createError}`);
          console.log(`📝 Manual creation required via Clerk Dashboard:`);
          console.log(`   - Name: ${testApp.name}`);
          console.log(`   - Enabled: ${testApp.enabled}`);
          console.log(`   - Scope: ${testApp.scope}`);
          console.log(`   - Client ID: ${testApp.client_id}`);
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to sync OAuth applications: ${error}`);
      return false;
    }
  }

  private async syncDomains(testDomains: ClerkDomain[]): Promise<boolean> {
    console.log('🔄 Syncing domains to Live environment...');
    
    try {
      // Get current Live domains
      const liveResponse = await this.clerkApi('/domains', this.liveSecretKey);
      const liveDomains: ClerkDomain[] = liveResponse.data || [];

      console.log(`Found ${liveDomains.length} existing domains in Live`);

      // Check if target domain exists
      const targetExists = liveDomains.find(domain => 
        domain.name === this.targetDomain || 
        domain.name === `www.${this.targetDomain}`
      );

      if (targetExists) {
        console.log(`✅ Target domain '${this.targetDomain}' already exists in Live (${targetExists.id})`);
        return true;
      }

      // Add target domain
      console.log(`➕ Adding domain '${this.targetDomain}' to Live...`);
      
      try {
        const newDomain = await this.clerkApi('/domains', this.liveSecretKey, 'POST', {
          name: this.targetDomain,
          is_primary: true
        });
        console.log(`✅ Added domain '${this.targetDomain}' (${newDomain.id})`);
      } catch (createError) {
        console.error(`❌ Failed to add domain '${this.targetDomain}': ${createError}`);
        console.log(`📝 Manual domain addition required via Clerk Dashboard`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to sync domains: ${error}`);
      return false;
    }
  }

  private async syncAllowedOrigins(): Promise<boolean> {
    console.log('🔄 Syncing allowed origins to Live environment...');
    
    try {
      // Get current Live instance
      const liveInstance: ClerkInstance = await this.clerkApi('/instance', this.liveSecretKey);
      
      const currentOrigins = liveInstance.allowed_origins || [];
      console.log(`Current origins: ${currentOrigins.join(', ')}`);

      // Check if target origins are already configured
      const missingOrigins = this.targetOrigins.filter(origin => 
        !currentOrigins.includes(origin)
      );

      if (missingOrigins.length === 0) {
        console.log('✅ All target origins already configured in Live');
        return true;
      }

      console.log(`➕ Adding missing origins: ${missingOrigins.join(', ')}`);

      // Add missing origins
      const updatedOrigins = [...currentOrigins, ...missingOrigins];
      
      try {
        await this.clerkApi('/instance', this.liveSecretKey, 'PATCH', {
          allowed_origins: updatedOrigins
        });
        console.log(`✅ Updated allowed origins in Live`);
      } catch (updateError) {
        console.error(`❌ Failed to update allowed origins: ${updateError}`);
        console.log(`📝 Manual origins configuration required via Clerk Dashboard:`);
        this.targetOrigins.forEach(origin => console.log(`   - ${origin}`));
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to sync allowed origins: ${error}`);
      return false;
    }
  }

  private async verifyLiveConfiguration(): Promise<boolean> {
    console.log('🔍 Verifying Live environment configuration...');
    
    try {
      // Use the existing verification script logic
      const { ClerkConfigVerifier } = await import('./verify-live-config');
      const verifier = new (ClerkConfigVerifier as any)();
      
      return await verifier.verify();
    } catch (error) {
      console.error(`❌ Verification failed: ${error}`);
      return false;
    }
  }

  public async sync(): Promise<boolean> {
    console.log('🚀 Starting Clerk configuration sync: Test → Live\n');

    try {
      // Step 1: Get Test environment configuration
      const testConfig = await this.getTestEnvironmentConfig();

      // Step 2: Sync OAuth applications
      const oauthSuccess = await this.syncOAuthApplications(testConfig.oauthApps);

      // Step 3: Sync domains
      const domainsSuccess = await this.syncDomains(testConfig.domains);

      // Step 4: Sync allowed origins
      const originsSuccess = await this.syncAllowedOrigins();

      // Step 5: Verify final configuration
      console.log('\n🔍 Running final verification...');
      const verificationSuccess = await this.verifyLiveConfiguration();

      const allSuccess = oauthSuccess && domainsSuccess && originsSuccess && verificationSuccess;

      console.log('\n📊 Sync Summary:');
      console.log(`OAuth Applications: ${oauthSuccess ? '✅' : '❌'}`);
      console.log(`Domains: ${domainsSuccess ? '✅' : '❌'}`);
      console.log(`Allowed Origins: ${originsSuccess ? '✅' : '❌'}`);
      console.log(`Final Verification: ${verificationSuccess ? '✅' : '❌'}`);

      if (allSuccess) {
        console.log('\n🎉 Clerk configuration sync completed successfully!');
        console.log('\n📝 Manual follow-up actions:');
        console.log('  1. Configure OAuth client_secret values in Clerk Dashboard');
        console.log('  2. Test Google login functionality on https://needport.jp/sign-in');
        console.log('  3. Verify redirect URLs are working correctly');
      } else {
        console.log('\n❌ Sync completed with errors. Manual configuration required.');
        console.log('\n🔧 Check Clerk Dashboard for:');
        console.log('  1. OAuth applications configuration');
        console.log('  2. Domain verification status');
        console.log('  3. Allowed origins settings');
        console.log('  4. Redirect URLs configuration');
      }

      return allSuccess;
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return false;
    }
  }
}

// Execute sync
async function main() {
  const syncer = new ClerkConfigSyncer();
  
  try {
    const success = await syncer.sync();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Sync process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { ClerkConfigSyncer };