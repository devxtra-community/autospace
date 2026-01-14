import { UserRole, UserStatus } from "@autospace/shared";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      status: UserStatus;
    }

    interface Request {
      user: User;
    }
  }
}

export {};
