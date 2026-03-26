"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_STATUS_TRANSITIONS = void 0;
const user_status_enum_1 = require("./user-status.enum");
exports.USER_STATUS_TRANSITIONS = {
    [user_status_enum_1.UserStatus.PENDING]: [user_status_enum_1.UserStatus.ACTIVE, user_status_enum_1.UserStatus.REJECTED],
    [user_status_enum_1.UserStatus.ACTIVE]: [user_status_enum_1.UserStatus.REJECTED],
    [user_status_enum_1.UserStatus.REJECTED]: [],
};
