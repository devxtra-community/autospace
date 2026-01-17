import { z } from "zod";
export declare const EmailSchema: z.ZodString;
export declare const PasswordSchema: z.ZodString;
export declare const PhoneSchema: z.ZodString;
export declare const BaseRegisterSchema: z.ZodObject<{
    fullname: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const UserRegisterSchema: z.ZodObject<{
    fullname: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    country: z.ZodString;
    state: z.ZodString;
    homeAddress: z.ZodString;
}, z.core.$strip>;
export declare const ValetRegisterSchema: z.ZodObject<{
    fullname: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    garageId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const ManagerRegisterSchema: z.ZodObject<{
    fullname: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    businessRegistrationNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
}, z.core.$strip>;
export declare const CompanyRegisterSchema: z.ZodObject<{
    fullname: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    companyName: z.ZodString;
    bussinessNumber: z.ZodCoercedNumber<unknown>;
    location: z.ZodString;
}, z.core.$strip>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type UserRegisterDto = z.infer<typeof UserRegisterSchema>;
export type ManagerRegisterDto = z.infer<typeof ManagerRegisterSchema>;
export type ValetRegisterDto = z.infer<typeof ValetRegisterSchema>;
export type CompanyRegisterDto = z.infer<typeof CompanyRegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type BaseRegisterDto = z.infer<typeof BaseRegisterSchema>;
