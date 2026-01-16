import { z } from "zod";
export declare const CreateGarageSchema: z.ZodObject<{
    name: z.ZodString;
    locationName: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    capacity: z.ZodNumber;
}, z.core.$strip>;
export type CreateGarageInput = z.infer<typeof CreateGarageSchema>;
//# sourceMappingURL=garage.schema.d.ts.map