import z from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "owner", "manager", "valet", "customer"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
