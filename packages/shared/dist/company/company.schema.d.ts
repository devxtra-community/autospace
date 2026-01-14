import { z } from "zod";
export declare const CreateCompanySchema: z.ZodObject<{
    companyName: z.ZodString;
    businessRegistrationNumber: z.ZodString;
    businessLocation: z.ZodString;
    contactEmail: z.ZodString;
    contactPhone: z.ZodString;
}, z.core.$strip>;
export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
