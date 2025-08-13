"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = document.cookie.includes('np_cookie_ok=1');
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Set cookie for 365 days
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    document.cookie = `np_cookie_ok=1; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    setShowBanner(false);
    
    // Enable tracking after consent
    if (typeof window !== 'undefined' && window.trackView) {
      window.trackView();
    }
  };

  const handleDecline = () => {
    // Set a temporary cookie to remember the decline (30 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    document.cookie = `np_cookie_declined=1; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            🍪 Cookieの使用について
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            当サイトでは、ユーザー体験の向上とサイトの改善のためにCookieを使用しています。
            サイトを利用することで、{' '}
            <Link href="/privacy" className="underline hover:text-blue-600">
              プライバシーポリシー
            </Link>
            {' '}に同意したことになります。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            同意する
          </button>
          <button
            onClick={handleDecline}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
          >
            あとで
          </button>
        </div>
      </div>
    </div>
  );
}
