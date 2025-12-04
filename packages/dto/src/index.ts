import { z } from "zod";

export const CreatePatientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  cf: z.string().optional(),
});

export type CreatePatientDto = z.infer<typeof CreatePatientSchema>;

export const UpdatePatientSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  cf: z.string().optional(),
  dentalChart: z.any().optional(), // JSON content for dental chart
});

export type UpdatePatientDto = z.infer<typeof UpdatePatientSchema>;

export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type UserLoginDto = z.infer<typeof UserLoginSchema>;

export const ConfirmUploadSchema = z.object({
  fileKey: z.string(),
  patientId: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  uploadedBy: z.string().optional(), // Assuming this can be inferred or passed
});

export type ConfirmUploadDto = z.infer<typeof ConfirmUploadSchema>;
