import { redirect } from 'next/navigation';

interface ChecklistItem {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

async function checkEnvironment(): Promise<ChecklistItem[]> {
  const items: ChecklistItem[] = [];
  
  // Check required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SITE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY', // サーバー専用
    'NP_ADMIN_PIN',
    'FF_NOTIFICATIONS'
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      items.push({
        name: `${envVar}`,
        status: 'pass',
        message: 'Present'
      });
    } else {
      items.push({
        name: `${envVar}`,
        status: 'fail',
        message: 'Missing'
      });
    }
  }

  // Check admin PIN is not default in production
  if (process.env.NODE_ENV === 'production' && process.env.NP_ADMIN_PIN === '1234') {
    items.push({
      name: 'NP_ADMIN_PIN',
      status: 'fail',
      message: 'Using default PIN in production'
    });
  }

  return items;
}

async function checkDatabase(): Promise<ChecklistItem[]> {
  const items: ChecklistItem[] = [];
  
  try {
    const { supabaseServer } = await import('@/lib/server/supabase');
    const supabase = supabaseServer();

    // Check required tables
    const requiredTables = [
      'needs',
      'offers', 
      'entry_notifications',
      'ip_throttle',
      'settings',
      'attachments'
    ];

    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          items.push({
            name: `Table: ${table}`,
            status: 'fail',
            message: 'Missing or inaccessible',
            details: error.message
          });
        } else {
          items.push({
            name: `Table: ${table}`,
            status: 'pass',
            message: 'Exists'
          });
        }
      } catch (e) {
        items.push({
          name: `Table: ${table}`,
          status: 'fail',
          message: 'Error checking table',
          details: String(e)
        });
      }
    }

    // Check storage bucket
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasAttachmentsBucket = buckets?.some(bucket => bucket.name === 'attachments');
      
      if (hasAttachmentsBucket) {
        items.push({
          name: 'Storage: attachments bucket',
          status: 'pass',
          message: 'Exists'
        });
      } else {
        items.push({
          name: 'Storage: attachments bucket',
          status: 'fail',
          message: 'Missing'
        });
      }
    } catch (e) {
      items.push({
        name: 'Storage: attachments bucket',
        status: 'fail',
        message: 'Error checking storage',
        details: String(e)
      });
    }

  } catch (e) {
    items.push({
      name: 'Database Connection',
      status: 'fail',
      message: 'Cannot connect to database',
      details: String(e)
    });
  }

  return items;
}

async function checkEmailHealth(): Promise<ChecklistItem[]> {
  const items: ChecklistItem[] = [];
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/notifications/health`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      const result = await response.json();
      items.push({
        name: 'Email Health',
        status: 'pass',
        message: 'Healthy',
        details: JSON.stringify(result)
      });
    } else {
      items.push({
        name: 'Email Health',
        status: 'fail',
        message: `HTTP ${response.status}`,
        details: await response.text()
      });
    }
  } catch (e) {
    items.push({
      name: 'Email Health',
      status: 'fail',
      message: 'Cannot reach health endpoint',
      details: String(e)
    });
  }

  return items;
}

async function checkEndpoints(): Promise<ChecklistItem[]> {
  const items: ChecklistItem[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  const endpoints = [
    '/sitemap.xml',
    '/feeds/needs.xml',
    '/feeds/needs.json'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      if (response.status === 200) {
        items.push({
          name: `Endpoint: ${endpoint}`,
          status: 'pass',
          message: 'Responds with 200'
        });
      } else {
        items.push({
          name: `Endpoint: ${endpoint}`,
          status: 'fail',
          message: `HTTP ${response.status}`
        });
      }
    } catch (e) {
      items.push({
        name: `Endpoint: ${endpoint}`,
        status: 'fail',
        message: 'Cannot reach endpoint',
        details: String(e)
      });
    }
  }

  return items;
}

async function checkPort(): Promise<ChecklistItem[]> {
  const items: ChecklistItem[] = [];
  
  try {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const devScript = packageJson.scripts?.dev || '';
    const portMatch = devScript.match(/-p\s+(\d+)/);
    const port = portMatch ? portMatch[1] : '3000';
    
    if (port === '3000') {
      items.push({
        name: 'Dev Port',
        status: 'pass',
        message: `Fixed to port ${port}`
      });
    } else {
      items.push({
        name: 'Dev Port',
        status: 'warning',
        message: `Using port ${port} (not 3000)`
      });
    }
  } catch (e) {
    items.push({
      name: 'Dev Port',
      status: 'fail',
      message: 'Cannot read package.json',
      details: String(e)
    });
  }

  return items;
}

export default async function DevChecklistPage() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    redirect('/404');
  }

  const [
    envItems,
    dbItems,
    emailItems,
    endpointItems,
    portItems
  ] = await Promise.all([
    checkEnvironment(),
    checkDatabase(),
    checkEmailHealth(),
    checkEndpoints(),
    checkPort()
  ]);

  const allItems = [
    ...envItems,
    ...dbItems,
    ...emailItems,
    ...endpointItems,
    ...portItems
  ];

  const passCount = allItems.filter(item => item.status === 'pass').length;
  const failCount = allItems.filter(item => item.status === 'fail').length;
  const warningCount = allItems.filter(item => item.status === 'warning').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-400';
      case 'fail': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      case 'warning': return '⚠';
      default: return '?';
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Deployment Checklist</h1>
      
      <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
        <div className="flex gap-4 text-sm">
          <span className="text-green-400">✓ {passCount} Pass</span>
          <span className="text-red-400">✗ {failCount} Fail</span>
          <span className="text-yellow-400">⚠ {warningCount} Warning</span>
        </div>
      </div>

      <div className="space-y-4">
        {allItems.map((item, index) => (
          <div key={index} className="p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <span className={`text-lg ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
              </span>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className={`text-sm ${getStatusColor(item.status)}`}>
                  {item.message}
                </div>
                {item.details && (
                  <div className="text-xs text-gray-400 mt-1 font-mono">
                    {item.details}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-zinc-800 rounded-lg">
        <h2 className="font-medium mb-2">Summary</h2>
        <p className="text-sm text-gray-400">
          {failCount === 0 
            ? 'All critical checks passed! Ready for deployment.' 
            : `${failCount} critical issue(s) need to be resolved before deployment.`
          }
        </p>
      </div>
    </div>
  );
}
