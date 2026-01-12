import { UserStatus } from "./user-status.enum";

export const USER_STATUS_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  [UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.REJECTED],

  [UserStatus.ACTIVE]: [UserStatus.SUSPENDED],

  [UserStatus.SUSPENDED]: [UserStatus.ACTIVE],

  [UserStatus.REJECTED]: [],
};
