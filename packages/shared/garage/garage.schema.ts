import { z } from "zod";

export const CreateGarageSchema = z.object({
  name: z.string().min(3),
  locationName: z.string().min(3),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  capacity: z.number().int().positive(),

  contactEmail: z.string().email().optional(),

  contactPhone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number")
    .optional(),
});

export type CreateGarageInput = z.infer<typeof CreateGarageSchema>;
