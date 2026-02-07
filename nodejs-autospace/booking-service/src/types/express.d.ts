import { UserRole, UserStatus } from "../types/auth.type.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        email: string;
        status: UserStatus;
      };
    }
  }
}

export {};
