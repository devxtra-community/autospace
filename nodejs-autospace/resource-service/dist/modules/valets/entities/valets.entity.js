"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Valet = exports.ValetAvailabilityStatus = exports.ValetEmployementStatus = void 0;
const typeorm_1 = require("typeorm");
var ValetEmployementStatus;
(function (ValetEmployementStatus) {
    ValetEmployementStatus["PENDING"] = "PENDING";
    ValetEmployementStatus["ACTIVE"] = "ACTIVE";
    ValetEmployementStatus["REJECTED"] = "REJECTED";
})(ValetEmployementStatus || (exports.ValetEmployementStatus = ValetEmployementStatus = {}));
var ValetAvailabilityStatus;
(function (ValetAvailabilityStatus) {
    ValetAvailabilityStatus["AVAILABLE"] = "AVAILABLE";
    ValetAvailabilityStatus["BUSY"] = "BUSY";
    ValetAvailabilityStatus["OFF_DUTY"] = "OFF_DUTY";
    ValetAvailabilityStatus["OFFLINE"] = "OFFLINE";
})(ValetAvailabilityStatus || (exports.ValetAvailabilityStatus = ValetAvailabilityStatus = {}));
let Valet = class Valet {
};
exports.Valet = Valet;
__decorate([
    (0, typeorm_1.PrimaryColumn)("uuid"),
    __metadata("design:type", String)
], Valet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "company_id", type: "uuid" }),
    __metadata("design:type", String)
], Valet.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "garage_id", type: "uuid" }),
    __metadata("design:type", String)
], Valet.prototype, "garageId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "employment_status",
        type: "enum",
        enum: ValetEmployementStatus,
        default: ValetEmployementStatus.PENDING,
    }),
    __metadata("design:type", String)
], Valet.prototype, "employmentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "availability_status",
        type: "enum",
        enum: ValetAvailabilityStatus,
        default: ValetAvailabilityStatus.OFFLINE,
    }),
    __metadata("design:type", String)
], Valet.prototype, "availabilityStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "current_booking_id", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], Valet.prototype, "currentBookingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "approved_by", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], Valet.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Valet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Valet.prototype, "updatedAt", void 0);
exports.Valet = Valet = __decorate([
    (0, typeorm_1.Entity)("valets")
], Valet);
