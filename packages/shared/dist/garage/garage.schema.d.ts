import { z } from "zod";
export declare const CreateGarageSchema: z.ZodObject<{
    name: z.ZodString;
    locationName: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    capacity: z.ZodNumber;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateGarageInput = z.infer<typeof CreateGarageSchema>;
