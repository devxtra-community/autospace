import { z } from "zod";
export declare const RegisterApiSchema: z.ZodObject<{
    fullname: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    role: z.ZodEnum<{
        admin: "admin";
        owner: "owner";
        manager: "manager";
        valet: "valet";
        customer: "customer";
    }>;
}, z.core.$strip>;
export type RegisterApiInput = z.infer<typeof RegisterApiSchema>;
//# sourceMappingURL=register.schema.d.ts.map