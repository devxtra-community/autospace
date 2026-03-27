export declare enum UserRole {
    ADMIN = "admin",
    OWNER = "owner",
    MANAGER = "manager",
    VALET = "valet",
    CUSTOMER = "customer"
}
export declare enum UserStatus {
    PENDING = "pending",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    REJECTED = "rejected"
}
export interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
}
//# sourceMappingURL=auth.type.d.ts.map