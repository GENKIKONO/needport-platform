import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'node:test';
import NeedCard from './NeedCard';
import type { Need, Offer, Membership } from '@/lib/mock/types';

// Mock dependencies
jest.mock('@/lib/flags', () => ({
  showB2BFeatures: jest.fn(),
}));

jest.mock('@/lib/ab', () => ({
  variant: jest.fn(),
  demoEndorseCount: jest.fn(),
}));

jest.mock('@/lib/ui/labels', () => ({
  label: jest.fn((key: string) => key),
  shouldShowPayments: jest.fn(),
}));

jest.mock('@/lib/featureFlags', () => ({
  STRIPE_ENABLED: false,
}));

jest.mock('@/lib/config', () => ({
  config: {
    GUEST_VIEW: false,
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('NeedCard B2B Endorsements Pill', () => {
  const mockNeed: Need = {
    id: 'test-need-123',
    title: 'Test Need Title',
    summary: 'Test need summary',
    description: 'Test need description',
    condition: 'open',
    scale: 'personal',
    tags: ['test', 'demo'],
    prejoin_count: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockOffer: Offer = {
    id: 'test-offer-123',
    need_id: 'test-need-123',
    title: 'Test Offer',
    description: 'Test offer description',
    min_people: 10,
    max_people: 20,
    price: 1000,
    status: 'adopted',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockMembership: Membership = {
    isGuest: false,
    userId: 'test-user-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ hasPrejoined: false, status: null }),
    });
  });

  afterEach(() => {
    // Restore environment variables
    delete process.env.EXPERIMENTAL_B2B;
    delete process.env.NEXT_PUBLIC_SITE_NOINDEX;
  });

  it('should show endorsements pill when both B2B flags are enabled', () => {
    // Arrange
    process.env.EXPERIMENTAL_B2B = '1';
    process.env.NEXT_PUBLIC_SITE_NOINDEX = '1';
    
    const { showB2BFeatures } = require('@/lib/flags');
    const { variant, demoEndorseCount } = require('@/lib/ab');
    
    showB2BFeatures.mockReturnValue(true);
    variant.mockReturnValue('A');
    demoEndorseCount.mockReturnValue(7);

    // Act
    render(
      <NeedCard
        need={mockNeed}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Assert
    const pill = screen.getByTestId('b2b-endorse-pill');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveAttribute('data-b2b-endorse-pill', 'v1');
    expect(screen.getByText('Endorsements')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should not show endorsements pill when EXPERIMENTAL_B2B is 0', () => {
    // Arrange
    process.env.EXPERIMENTAL_B2B = '0';
    process.env.NEXT_PUBLIC_SITE_NOINDEX = '1';
    
    const { showB2BFeatures } = require('@/lib/flags');
    showB2BFeatures.mockReturnValue(false);

    // Act
    render(
      <NeedCard
        need={mockNeed}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Assert
    const pill = screen.queryByTestId('b2b-endorse-pill');
    expect(pill).not.toBeInTheDocument();
  });

  it('should not show endorsements pill when NEXT_PUBLIC_SITE_NOINDEX is 0', () => {
    // Arrange
    process.env.EXPERIMENTAL_B2B = '1';
    process.env.NEXT_PUBLIC_SITE_NOINDEX = '0';
    
    const { showB2BFeatures } = require('@/lib/flags');
    showB2BFeatures.mockReturnValue(false);

    // Act
    render(
      <NeedCard
        need={mockNeed}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Assert
    const pill = screen.queryByTestId('b2b-endorse-pill');
    expect(pill).not.toBeInTheDocument();
  });

  it('should show unlock proposals text for variant B', () => {
    // Arrange
    process.env.EXPERIMENTAL_B2B = '1';
    process.env.NEXT_PUBLIC_SITE_NOINDEX = '1';
    
    const { showB2BFeatures } = require('@/lib/flags');
    const { variant, demoEndorseCount } = require('@/lib/ab');
    
    showB2BFeatures.mockReturnValue(true);
    variant.mockReturnValue('B');
    demoEndorseCount.mockReturnValue(5);

    // Act
    render(
      <NeedCard
        need={mockNeed}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Assert
    expect(screen.getByText('UnlockProposals')).toBeInTheDocument();
  });

  it('should not show unlock proposals text for variant A', () => {
    // Arrange
    process.env.EXPERIMENTAL_B2B = '1';
    process.env.NEXT_PUBLIC_SITE_NOINDEX = '1';
    
    const { showB2BFeatures } = require('@/lib/flags');
    const { variant, demoEndorseCount } = require('@/lib/ab');
    
    showB2BFeatures.mockReturnValue(true);
    variant.mockReturnValue('A');
    demoEndorseCount.mockReturnValue(5);

    // Act
    render(
      <NeedCard
        need={mockNeed}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Assert
    expect(screen.queryByText('UnlockProposals')).not.toBeInTheDocument();
  });

  it('should call demoEndorseCount with correct seed', () => {
    // Arrange
    process.env.EXPERIMENTAL_B2B = '1';
    process.env.NEXT_PUBLIC_SITE_NOINDEX = '1';
    
    const { showB2BFeatures } = require('@/lib/flags');
    const { variant, demoEndorseCount } = require('@/lib/ab');
    
    showB2BFeatures.mockReturnValue(true);
    variant.mockReturnValue('A');
    demoEndorseCount.mockReturnValue(6);

    // Act
    render(
      <NeedCard
        need={mockNeed}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Assert
    expect(demoEndorseCount).toHaveBeenCalledWith('test-need-123');
  });

  it('should use fallback seed when need.id is not available', () => {
    // Arrange
    process.env.EXPERIMENTAL_B2B = '1';
    process.env.NEXT_PUBLIC_SITE_NOINDEX = '1';
    
    const needWithoutId = { ...mockNeed, id: undefined };
    const { showB2BFeatures } = require('@/lib/flags');
    const { variant, demoEndorseCount } = require('@/lib/ab');
    
    showB2BFeatures.mockReturnValue(true);
    variant.mockReturnValue('A');
    demoEndorseCount.mockReturnValue(8);

    // Act
    render(
      <NeedCard
        need={needWithoutId}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Assert
    expect(demoEndorseCount).toHaveBeenCalledWith('Test Need Title|2024-01-01T00:00:00Z');
  });

  it('should not make network calls when B2B features are enabled', () => {
    // Arrange
    process.env.EXPERIMENTAL_B2B = '1';
    process.env.NEXT_PUBLIC_SITE_NOINDEX = '1';
    
    const { showB2BFeatures } = require('@/lib/flags');
    const { variant, demoEndorseCount } = require('@/lib/ab');
    
    showB2BFeatures.mockReturnValue(true);
    variant.mockReturnValue('A');
    demoEndorseCount.mockReturnValue(4);

    // Act
    render(
      <NeedCard
        need={mockNeed}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Assert
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should render deterministic count for same need', () => {
    // Arrange
    process.env.EXPERIMENTAL_B2B = '1';
    process.env.NEXT_PUBLIC_SITE_NOINDEX = '1';
    
    const { showB2BFeatures } = require('@/lib/flags');
    const { variant, demoEndorseCount } = require('@/lib/ab');
    
    showB2BFeatures.mockReturnValue(true);
    variant.mockReturnValue('A');
    demoEndorseCount.mockReturnValue(9);

    // Act
    const { rerender } = render(
      <NeedCard
        need={mockNeed}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Re-render with same props
    rerender(
      <NeedCard
        need={mockNeed}
        adoptedOffer={null}
        membership={mockMembership}
      />
    );

    // Assert
    expect(demoEndorseCount).toHaveBeenCalledTimes(2);
    expect(demoEndorseCount).toHaveBeenNthCalledWith(1, 'test-need-123');
    expect(demoEndorseCount).toHaveBeenNthCalledWith(2, 'test-need-123');
  });
});
