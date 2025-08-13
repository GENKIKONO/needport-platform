'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

interface ConnectStatus {
  hasAccount: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  missingFields: string[];
  accountId?: string;
}

export default function PayoutsPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Stripe is configured
  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    if (isLoaded && user) {
      fetchConnectStatus();
    }
  }, [isLoaded, user]);

  // Handle success/refresh messages
  useEffect(() => {
    const success = searchParams.get('success');
    const refresh = searchParams.get('refresh');
    
    if (success) {
      setError(null);
      fetchConnectStatus();
    }
    if (refresh) {
      fetchConnectStatus();
    }
  }, [searchParams]);

  const fetchConnectStatus = async () => {
    try {
      const response = await fetch('/api/connect/status');
      if (response.ok) {
        const data = await response.json();
        setConnectStatus(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load Connect status');
      }
    } catch (err) {
      setError('Failed to load Connect status');
    }
  };

  const handleCreateAccount = async () => {
    if (!isStripeConfigured) {
      setError('Stripe is not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/connect/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Account created, now create onboarding link
        await handleCreateOnboardingLink();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create Connect account');
      }
    } catch (err) {
      setError('Failed to create Connect account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOnboardingLink = async () => {
    try {
      const response = await fetch('/api/connect/account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'account_onboarding',
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create onboarding link');
      }
    } catch (err) {
      setError('Failed to create onboarding link');
    }
  };

  const handleUpdateAccount = async () => {
    if (!isStripeConfigured) {
      setError('Stripe is not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/connect/account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'account_update',
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create update link');
      }
    } catch (err) {
      setError('Failed to create update link');
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
          <p className="text-gray-600">You need to be signed in to access payouts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Payouts & Connect Account</h1>

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
                      Stripe Connect Not Configured
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Stripe Connect is not configured. Please set up your Stripe environment variables to enable payout features.
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
              {/* Account Status */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Status</h2>
                {connectStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Connect Account:</span>
                      <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                        connectStatus.hasAccount 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {connectStatus.hasAccount ? 'Created' : 'Not Created'}
                      </span>
                    </div>

                    {connectStatus.hasAccount && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Account Complete:</span>
                          <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                            connectStatus.isComplete 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {connectStatus.isComplete ? 'Complete' : 'Incomplete'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Account Enabled:</span>
                          <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                            connectStatus.isEnabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {connectStatus.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>

                        {!connectStatus.isComplete && (
                          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-orange-800">
                                  Account Incomplete
                                </h3>
                                <div className="mt-1 text-sm text-orange-700">
                                  <p>Your account is not complete. You cannot receive payments until all required information is provided.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {connectStatus.missingFields.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Missing Fields:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {connectStatus.missingFields.map((field, index) => (
                                <li key={index} className="flex items-center">
                                  <svg className="h-4 w-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  {field.replace(/_/g, ' ')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Loading...</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Setup</h2>
                
                {!connectStatus?.hasAccount ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Create a Stripe Connect account to start receiving payments for your services.
                    </p>
                    <button
                      onClick={handleCreateAccount}
                      disabled={!isStripeConfigured || isLoading}
                      className={`py-2 px-4 rounded-md font-medium ${
                        !isStripeConfigured || isLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isLoading ? 'Creating...' : 'Create Connect Account'}
                    </button>
                  </div>
                ) : !connectStatus.isComplete ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Complete your account setup to enable payments. You need to provide business and personal information.
                    </p>
                    <button
                      onClick={handleCreateOnboardingLink}
                      disabled={!isStripeConfigured || isLoading}
                      className={`py-2 px-4 rounded-md font-medium ${
                        !isStripeConfigured || isLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      {isLoading ? 'Loading...' : 'Complete Onboarding'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Your account is complete and ready to receive payments. You can update your information anytime.
                    </p>
                    <button
                      onClick={handleUpdateAccount}
                      disabled={!isStripeConfigured || isLoading}
                      className={`py-2 px-4 rounded-md font-medium ${
                        !isStripeConfigured || isLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isLoading ? 'Loading...' : 'Update Account'}
                    </button>
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• Create a Stripe Connect account to receive payments directly to your bank account</p>
                  <p>• Complete the onboarding process with your business and personal information</p>
                  <p>• Once verified, you can start receiving payments for your services</p>
                  <p>• Payments are automatically transferred to your connected bank account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
