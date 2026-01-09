import { UserRole, UserStatus } from "../constants/role.enum";

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}
