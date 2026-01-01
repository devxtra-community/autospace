import { UserStatus } from './user-status.enum';

export const USER_STATUS_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  [UserStatus.PENDING]: [UserStatus.APPROVED, UserStatus.REJECTED],
  [UserStatus.APPROVED]: [UserStatus.SUSPENDED],
  [UserStatus.SUSPENDED]: [UserStatus.APPROVED],
  [UserStatus.REJECTED]: [],
};
