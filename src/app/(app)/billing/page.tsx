'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { loadStripe } from '@stripe/stripe-js';

interface BillingStatus {
  hasSubscription: boolean;
  tier?: 'user' | 'pro';
  customerId?: string;
}

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Stripe is configured and payments are enabled
  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const isPaymentsEnabled = process.env.PAYMENTS_ENABLED === '1';
  
  // Don't render if payments are disabled
  if (!isPaymentsEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              決済機能は現在無効です
            </h2>
            <p className="text-gray-600">
              決済機能は近日中にリリース予定です。
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (isLoaded && user) {
      fetchBillingStatus();
    }
  }, [isLoaded, user]);

  const fetchBillingStatus = async () => {
    try {
      const response = await fetch('/api/billing/status');
      if (response.ok) {
        const data = await response.json();
        setBillingStatus(data);
      } else {
        setError('Failed to load billing status');
      }
    } catch (err) {
      setError('Failed to load billing status');
    }
  };

  const handleSubscribe = async (tier: 'user' | 'pro') => {
    if (!isStripeConfigured) {
      setError('Stripe is not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: tier === 'user' 
            ? process.env.NEXT_PUBLIC_STRIPE_PRICE_USER_MONTHLY
            : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (stripe) {
          window.location.href = url;
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError('Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!isStripeConfigured) {
      setError('Stripe is not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create billing portal session');
      }
    } catch (err) {
      setError('Failed to create billing portal session');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to access billing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscription</h1>

            {!isStripeConfigured && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Stripe Not Configured
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Stripe billing is not configured. Please set up your Stripe environment variables to enable billing features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
                {billingStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subscription Status:</span>
                      <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                        billingStatus.hasSubscription 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {billingStatus.hasSubscription ? 'Active' : 'No Active Subscription'}
                      </span>
                    </div>
                    {billingStatus.tier && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {billingStatus.tier} Plan
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Loading...</p>
                )}
              </div>

              {/* Subscription Plans */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* User Plan */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Plan</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-4">¥500<span className="text-sm font-normal text-gray-500">/month</span></p>
                  <ul className="text-sm text-gray-600 mb-6 space-y-2">
                    <li>• Basic features</li>
                    <li>• Standard support</li>
                    <li>• Limited usage</li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe('user')}
                    disabled={!isStripeConfigured || isLoading || billingStatus?.hasSubscription}
                    className={`w-full py-2 px-4 rounded-md font-medium ${
                      !isStripeConfigured || isLoading || billingStatus?.hasSubscription
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Processing...' : billingStatus?.hasSubscription ? 'Already Subscribed' : 'Subscribe'}
                  </button>
                </div>

                {/* Pro Plan */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro Plan</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-4">¥5,000<span className="text-sm font-normal text-gray-500">/month</span></p>
                  <ul className="text-sm text-gray-600 mb-6 space-y-2">
                    <li>• All features</li>
                    <li>• Priority support</li>
                    <li>• Unlimited usage</li>
                    <li>• Advanced analytics</li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe('pro')}
                    disabled={!isStripeConfigured || isLoading || billingStatus?.hasSubscription}
                    className={`w-full py-2 px-4 rounded-md font-medium ${
                      !isStripeConfigured || isLoading || billingStatus?.hasSubscription
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isLoading ? 'Processing...' : billingStatus?.hasSubscription ? 'Already Subscribed' : 'Subscribe'}
                  </button>
                </div>
              </div>

              {/* Manage Billing */}
              {billingStatus?.hasSubscription && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Subscription</h2>
                  <p className="text-gray-600 mb-4">
                    Update your payment method, view billing history, or cancel your subscription.
                  </p>
                  <button
                    onClick={handleManageBilling}
                    disabled={!isStripeConfigured || isLoading}
                    className={`py-2 px-4 rounded-md font-medium ${
                      !isStripeConfigured || isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 'Manage Billing'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
