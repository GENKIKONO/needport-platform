// Feature flags read from environment variables
export const FF_PUBLIC_ENTRY = process.env.FF_PUBLIC_ENTRY !== "false"; // default true
export const FF_NOTIFICATIONS = process.env.FF_NOTIFICATIONS === "true"; // default false
export const FF_PAGINATION = process.env.FF_PAGINATION !== "false"; // default true
export const FF_SENTRY = process.env.FF_SENTRY === "true"; // default false
