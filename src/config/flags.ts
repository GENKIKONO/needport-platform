export const flags = {
  paymentsEnabled: process.env.PAYMENTS_ENABLED === 'true' || process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true',
  bankTransferEnabled: true,
};
