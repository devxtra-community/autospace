"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["OWNER"] = "owner";
    UserRole["MANAGER"] = "manager";
    UserRole["VALET"] = "valet";
    UserRole["CUSTOMER"] = "customer";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["PENDING"] = "pending";
    UserStatus["ACTIVE"] = "active";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["REJECTED"] = "rejected";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
