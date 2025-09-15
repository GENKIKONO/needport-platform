// tests/monitoring-setup.ts
// Global setup for monitoring tests

async function globalSetup() {
  console.log('🔧 Setting up monitoring test environment...');
  
  // Validate environment
  const baseUrl = process.env.BASE_URL || 'https://needport.jp';
  console.log(`📍 Target environment: ${baseUrl}`);
  
  // Pre-flight check: ensure target is reachable
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    console.log('✅ Pre-flight health check passed');
  } catch (error) {
    console.error('❌ Pre-flight health check failed:', error);
    throw error;
  }
  
  console.log('✅ Monitoring test environment ready');
}

export default globalSetup;