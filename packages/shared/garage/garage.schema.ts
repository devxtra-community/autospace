import { z } from "zod";

export const CreateGarageSchema = z.object({
  name: z.string().min(3),
  locationName: z.string().min(3),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  capacity: z.number().int().positive(),
});

export type CreateGarageInput = z.infer<typeof CreateGarageSchema>;
