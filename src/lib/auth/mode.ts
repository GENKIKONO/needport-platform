// Authentication mode configuration
export const AUTH_MODE = process.env.AUTH_MODE === 'clerk' ? 'clerk' : 'simple';
export const isClerk = AUTH_MODE === 'clerk';
export const isSimple = AUTH_MODE === 'simple';
