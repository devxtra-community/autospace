import { z } from "zod";

export const CreateCompanySchema = z.object({
  companyName: z.string().min(2).max(150),

  businessRegistrationNumber: z.string().min(3).max(100),

  businessLocation: z.string().min(2).max(200),

  contactEmail: z.string().email(),

  contactPhone: z.string().min(7).max(20),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
