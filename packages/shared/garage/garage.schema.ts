import { z } from "zod";

export const CreateGarageSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(3),
  locationName: z.string().min(3),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  capacity: z.number().int().positive(),
  valetAvailable: z.boolean().optional(),
});

export type CreateGarageInput = z.infer<typeof CreateGarageSchema>;
