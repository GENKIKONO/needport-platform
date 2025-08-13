"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('np_cookie_choice');
    if (!cookieChoice) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('np_cookie_choice', 'accepted');
    localStorage.setItem('np_cookie_ok', '1');
    setIsVisible(false);
    
    // Enable tracking
    if (typeof window !== 'undefined' && window.trackView) {
      window.trackView();
    }
  };

  const handleDecline = () => {
    localStorage.setItem('np_cookie_choice', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            このサイトでは、ユーザー体験の向上のためにCookieを使用しています。
            サイトを利用することで、プライバシーポリシーに同意したことになります。
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            拒否
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            同意
          </button>
        </div>
      </div>
    </div>
  );
}
