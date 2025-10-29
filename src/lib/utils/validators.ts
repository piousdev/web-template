import { z } from "zod";
import { REGEX_PATTERNS } from "./constants";

// Common field validators
export const validators = {
  email: z.string().email("Invalid email address").min(1, "Email is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      REGEX_PATTERNS.PASSWORD,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),

  phone: z.string().regex(REGEX_PATTERNS.PHONE, "Invalid phone number"),

  url: z.string().url("Invalid URL").or(z.literal("")),

  uuid: z.string().uuid("Invalid UUID"),

  name: z.string().min(1, "Name is required").max(100, "Name is too long"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),

  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
};

// Authentication schemas
export const authSchemas = {
  login: z.object({
    email: validators.email,
    password: z.string().min(1, "Password is required"),
  }),

  register: z.object({
    name: validators.name,
    email: validators.email,
    password: validators.password,
  }),

  forgotPassword: z.object({
    email: validators.email,
  }),

  resetPassword: z
    .object({
      token: z.string().min(1, "Token is required"),
      password: validators.password,
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  changePassword: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: validators.password,
      confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  updateProfile: z.object({
    name: validators.name,
    email: validators.email,
    phone: validators.phone.optional(),
    image: validators.url.optional(),
  }),
};

// User schemas
export const userSchemas = {
  create: z.object({
    name: validators.name,
    email: validators.email,
    password: validators.password,
  }),

  update: z.object({
    name: validators.name.optional(),
    email: validators.email.optional(),
    phone: validators.phone.optional(),
    image: validators.url.optional(),
  }),

  id: z.object({
    id: validators.uuid,
  }),
};

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  filters: z.record(z.string(), z.unknown()).optional(),
  ...paginationSchema.shape,
});

// API response schemas
export const apiResponseSchemas = {
  success: <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
      success: z.literal(true),
      data: dataSchema,
      message: z.string().optional(),
    }),

  error: z.object({
    success: z.literal(false),
    error: z.string(),
    code: z.string().optional(),
  }),

  paginated: <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
      success: z.literal(true),
      data: z.array(itemSchema),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
      }),
    }),
};

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(["image", "document", "other"]).default("other"),
  maxSize: z.number().optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: validators.name,
  email: validators.email,
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
});

// Type exports for use in components
export type LoginInput = z.infer<typeof authSchemas.login>;
export type RegisterInput = z.infer<typeof authSchemas.register>;
export type ForgotPasswordInput = z.infer<typeof authSchemas.forgotPassword>;
export type ResetPasswordInput = z.infer<typeof authSchemas.resetPassword>;
export type ChangePasswordInput = z.infer<typeof authSchemas.changePassword>;
export type UpdateProfileInput = z.infer<typeof authSchemas.updateProfile>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
