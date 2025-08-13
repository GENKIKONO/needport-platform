'use client';

import { useEffect, useState } from 'react';

interface EnvBadgeProps {
  forceShow?: boolean;
}

export default function EnvBadge({ forceShow = false }: EnvBadgeProps) {
  const [env, setEnv] = useState<string>('');
  const [version, setVersion] = useState<string>('');
  const [commitSha, setCommitSha] = useState<string>('');

  useEffect(() => {
    setEnv(process.env.NEXT_PUBLIC_APP_ENV || 'development');
    setVersion(process.env.NEXT_PUBLIC_APP_VERSION || '');
    setCommitSha(process.env.NEXT_PUBLIC_COMMIT_SHA || '');
  }, []);

  // Hide in production unless forced to show
  if (env === 'production' && !forceShow) {
    return null;
  }

  const getEnvColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'bg-red-600 text-white';
      case 'staging':
        return 'bg-yellow-600 text-white';
      case 'development':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getVersionText = () => {
    if (version && commitSha) {
      return `${version} (${commitSha.slice(0, 7)})`;
    } else if (version) {
      return version;
    } else if (commitSha) {
      return commitSha.slice(0, 7);
    }
    return '';
  };

  return (
    <div className="fixed top-2 right-2 z-50 pointer-events-none">
      <div className={`px-2 py-1 text-xs font-mono rounded shadow-lg ${getEnvColor(env)}`}>
        <div className="font-semibold">{env.toUpperCase()}</div>
        {getVersionText() && (
          <div className="text-xs opacity-90">{getVersionText()}</div>
        )}
      </div>
    </div>
  );
}
