import * as z from "zod";

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be under 100 characters"),

    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be under 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Only letters, numbers, and underscores allowed",
      )
      .regex(/^\S+$/, "Username cannot contain spaces"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    dob: z
      .string()
      .min(1, "Date of birth is required")
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return !isNaN(date.getTime()) && age >= 13 && age <= 120 && date < now;
      }, "You must be at least 13 years old with a valid date"),

    gender: z.enum(["male", "female", "other"], {
      error: (issue) => ({ message: "Please select a valid gender" }),
    }),

    phone_no: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+?[0-9\s-]{8,15}$/, "Please enter a valid phone number"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
