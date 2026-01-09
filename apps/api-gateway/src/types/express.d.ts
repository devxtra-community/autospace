import { UserStatus } from "../constants/role.enum";
import { UserRole } from "../modules/auth/constants";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      status: UserStatus;
    }
    interface Request {
      user?: User;
    }
  }
}
