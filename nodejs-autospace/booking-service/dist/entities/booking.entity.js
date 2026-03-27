var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, } from "typeorm";
export var BookingValetStatus;
(function (BookingValetStatus) {
    BookingValetStatus["NONE"] = "NONE";
    BookingValetStatus["REQUESTED"] = "REQUESTED";
    BookingValetStatus["ASSIGNED"] = "ASSIGNED";
    BookingValetStatus["ON_THE_WAY_TO_PICKUP"] = "ON_THE_WAY_TO_PICKUP";
    BookingValetStatus["PICKED_UP"] = "PICKED_UP";
    BookingValetStatus["PARKED"] = "PARKED";
    BookingValetStatus["ON_THE_WAY_TO_DROP"] = "ON_THE_WAY_TO_DROP";
    BookingValetStatus["COMPLETED"] = "COMPLETED";
    BookingValetStatus["REJECTED"] = "REJECTED";
})(BookingValetStatus || (BookingValetStatus = {}));
let Booking = class Booking {
    id;
    userId;
    garageId;
    slotId;
    startTime;
    endTime;
    status;
    valetRequested;
    valetStatus;
    vehicleType;
    valetId;
    entryPin;
    exitPin;
    entryUsed;
    exitUsed;
    pickupPin;
    pickupPinUsed;
    currentValetRequestId;
    rejectedValetIds;
    amount;
    pickupLatitude;
    pickupLongitude;
    pickupAddress;
    paymentStatus;
    reviewSubmitted;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Booking.prototype, "id", void 0);
__decorate([
    Column("uuid"),
    __metadata("design:type", String)
], Booking.prototype, "userId", void 0);
__decorate([
    Column("uuid"),
    __metadata("design:type", String)
], Booking.prototype, "garageId", void 0);
__decorate([
    Column("uuid"),
    __metadata("design:type", String)
], Booking.prototype, "slotId", void 0);
__decorate([
    Column("timestamp"),
    __metadata("design:type", Date)
], Booking.prototype, "startTime", void 0);
__decorate([
    Column("timestamp"),
    __metadata("design:type", Date)
], Booking.prototype, "endTime", void 0);
__decorate([
    Column("varchar", { default: "pending", length: 50 }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    Column({ name: "valet_requested", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "valetRequested", void 0);
__decorate([
    Column({
        name: "valet_status",
        type: "enum",
        enum: BookingValetStatus,
        default: BookingValetStatus.NONE,
    }),
    __metadata("design:type", String)
], Booking.prototype, "valetStatus", void 0);
__decorate([
    Column({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "vehicleType", void 0);
__decorate([
    Column({ name: "valet_id", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "valetId", void 0);
__decorate([
    Column({ type: "varchar", length: 5, nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "entryPin", void 0);
__decorate([
    Column({ type: "varchar", length: 5, nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "exitPin", void 0);
__decorate([
    Column({ name: "entry_used", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "entryUsed", void 0);
__decorate([
    Column({ name: "exit_used", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "exitUsed", void 0);
__decorate([
    Column({ name: "pickup_pin", type: "varchar", length: 5, nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "pickupPin", void 0);
__decorate([
    Column({ name: "pickup_pin_used", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "pickupPinUsed", void 0);
__decorate([
    Column({ name: "current_valet_request_id", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "currentValetRequestId", void 0);
__decorate([
    Column({ name: "rejected_valet_ids", type: "json", nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "rejectedValetIds", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Booking.prototype, "amount", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "pickupLatitude", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "pickupLongitude", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "pickupAddress", void 0);
__decorate([
    Column({
        type: "varchar",
        length: 20,
        default: "unpaid",
    }),
    __metadata("design:type", String)
], Booking.prototype, "paymentStatus", void 0);
__decorate([
    Column({
        name: "review_submitted",
        type: "boolean",
        default: false,
    }),
    __metadata("design:type", Boolean)
], Booking.prototype, "reviewSubmitted", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Booking.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Booking.prototype, "updatedAt", void 0);
Booking = __decorate([
    Entity({ name: "booking" })
], Booking);
export { Booking };
//# sourceMappingURL=booking.entity.js.map