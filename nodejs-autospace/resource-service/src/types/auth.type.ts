export enum UserRole {
  ADMIN = "admin",
  OWNER = "owner",
  MANAGER = "manager",
  VALET = "valet",
  CUSTOMER = "customer",
}

export enum UserStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}
