import { z } from "zod";

export const generalProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  city: z.string().optional(),
  intro: z.string().max(500).optional(),
  notifyEmail: z.boolean().default(true),
});

export const vendorOnboardingSchema = z.object({
  companyName: z.string().min(2).max(120),
  companyKana: z.string().optional(),
  website: z.string().url().optional(),
  industries: z.array(z.string()).max(10).optional(),
  serviceAreas: z.array(z.string()).max(20).optional(),
  portfolioUrls: z.array(z.string().url()).max(10).optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  invoiceQualified: z.boolean().default(false),
  intro: z.string().max(2000).optional(),
  agreeTerms: z.literal(true),
});
