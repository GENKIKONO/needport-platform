"use client";

import { useEffect, useState } from "react";

export default function EnvBanner() {
  const [env, setEnv] = useState<string>('production');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get environment from environment variable or default to production
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'production';
    setEnv(appEnv);
    setIsVisible(appEnv !== 'production');
  }, []);

  if (!isVisible) {
    return null;
  }

  const getEnvConfig = (env: string) => {
    switch (env) {
      case 'staging':
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-900',
          label: 'STAGING'
        };
      case 'development':
        return {
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-900',
          label: 'DEV'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-900',
          label: env.toUpperCase()
        };
    }
  };

  const config = getEnvConfig(env);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${config.bgColor} ${config.textColor} text-center py-1 text-xs font-medium`}>
      {config.label} 環境
    </div>
  );
}
