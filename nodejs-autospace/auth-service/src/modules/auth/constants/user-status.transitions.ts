import { UserStatus } from "./user-status.enum";

export const USER_STATUS_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  [UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.REJECTED],

  [UserStatus.ACTIVE]: [UserStatus.REJECTED],

  [UserStatus.REJECTED]: [],
};
