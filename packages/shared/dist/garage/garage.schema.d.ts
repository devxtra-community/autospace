import { z } from "zod";
export declare const CreateGarageSchema: z.ZodObject<{
    name: z.ZodString;
    locationName: z.ZodString;
    latitude: z.ZodCoercedNumber<unknown>;
    longitude: z.ZodCoercedNumber<unknown>;
    capacity: z.ZodNumber;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CreateFloorSchema: z.ZodObject<{
    garageCode: z.ZodString;
    floorNumber: z.ZodNumber;
}, z.core.$strip>;
export declare const CreateSlotSchema: z.ZodObject<{
    floorNumber: z.ZodNumber;
    slotNumber: z.ZodString;
    pricePerHour: z.ZodNumber;
}, z.core.$strip>;
export type CreateSlotInput = z.infer<typeof CreateSlotSchema>;
export type CreateGarageInput = z.infer<typeof CreateGarageSchema>;
export type CreateFloorInput = z.infer<typeof CreateFloorSchema>;
