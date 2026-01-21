import { z } from "zod";

export const CreateSlotSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid startTime format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid endTime format (HH:MM)"),
  price: z.number().positive("Price must be greater than 0"),
});

export type CreateSlotInput = z.infer<typeof CreateSlotSchema>;
