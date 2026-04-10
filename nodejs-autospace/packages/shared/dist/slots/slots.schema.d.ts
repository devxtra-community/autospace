import { z } from "zod";
export declare const CreateSlotSchema: z.ZodObject<{
    date: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    price: z.ZodNumber;
}, z.core.$strip>;
export type CreateSlotInput = z.infer<typeof CreateSlotSchema>;
