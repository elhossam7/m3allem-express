import { z } from 'zod';
import { ServiceCategory, UserRole } from '../types';

// Job Request Form Schema
export const jobRequestSchema = z.object({
  category: z.nativeEnum(ServiceCategory, {
    errorMap: () => ({ message: 'Please select a service category' }),
  }),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  location: z
    .string()
    .min(5, 'Please provide a detailed location')
    .max(200, 'Location cannot exceed 200 characters'),
  proposedPrice: z
    .number()
    .min(50, 'Minimum price is 50 MAD')
    .max(10000, 'Maximum price is 10,000 MAD'),
  urgency: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select urgency level' }),
  }),
  preferredDate: z.date().min(new Date(), 'Date cannot be in the past').optional(),
  additionalNotes: z.string().max(300, 'Notes cannot exceed 300 characters').optional(),
});

export type JobRequestFormData = z.infer<typeof jobRequestSchema>;

// User Profile Schema
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^(\+212|0)[6-7]\d{8}$/, 'Please enter a valid Moroccan phone number'),
  location: z
    .string()
    .min(5, 'Please provide a detailed location')
    .max(100, 'Location cannot exceed 100 characters'),
  avatar: z.string().url('Please enter a valid image URL').optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

// Artisan Profile Schema
export const artisanProfileSchema = userProfileSchema.extend({
  specializations: z
    .array(z.nativeEnum(ServiceCategory))
    .min(1, 'Please select at least one specialization')
    .max(5, 'Maximum 5 specializations allowed'),
  experience: z
    .number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  hourlyRate: z
    .number()
    .min(30, 'Minimum hourly rate is 30 MAD')
    .max(500, 'Maximum hourly rate is 500 MAD'),
  availability: z.object({
    monday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
    tuesday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
    wednesday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
    thursday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
    friday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
    saturday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
    sunday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
  }),
});

export type ArtisanProfileFormData = z.infer<typeof artisanProfileSchema>;

// Review Schema
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review cannot exceed 500 characters'),
  wouldRecommend: z.boolean(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// Authentication Schema
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  phone: z
    .string()
    .regex(/^(\+212|0)[6-7]\d{8}$/, 'Please enter a valid Moroccan phone number'),
  role: z.nativeEnum(UserRole),
  location: z
    .string()
    .min(5, 'Please provide a detailed location')
    .max(100, 'Location cannot exceed 100 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Search Filters Schema
export const searchFiltersSchema = z.object({
  location: z.string().optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  minRating: z.number().min(0).max(5).optional(),
  availability: z.enum(['immediate', 'within-week', 'flexible']).optional(),
  specializations: z.array(z.nativeEnum(ServiceCategory)).optional(),
  isVerified: z.boolean().optional(),
  maxDistance: z.number().min(1).max(100).optional(), // in km
});

export type SearchFiltersData = z.infer<typeof searchFiltersSchema>;
