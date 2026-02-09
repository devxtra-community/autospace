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

export const CreateFloorSchema = z.object({
  floorNumber: z.number().int().nonnegative(),
});

export const CreateSlotSchema = z.object({
  floorNumber: z.number().int().nonnegative(),

  // Only A1–A5, B1–B5, etc.
  slotNumber: z
    .string()
    .regex(/^[A-Z][1-5]$/, "Slot must be A1–A5, B1–B5, etc."),

  slotSize: z.enum(["STANDARD", "LARGE"]),
});

export type CreateSlotInput = z.infer<typeof CreateSlotSchema>;
export type CreateGarageInput = z.infer<typeof CreateGarageSchema>;
export type CreateFloorInput = z.infer<typeof CreateFloorSchema>;
