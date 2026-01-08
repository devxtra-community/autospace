import { UserRole } from "../modules/auth/constants";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      status: string;
    }
    interface Request {
      user?: User;
    }
  }
}
