var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
let Booking = class Booking {
    id;
    userId;
    garageId;
    slotId;
    startTime;
    endTime;
    status;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Booking.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Booking.prototype, "userId", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Booking.prototype, "garageId", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Booking.prototype, "slotId", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], Booking.prototype, "startTime", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], Booking.prototype, "endTime", void 0);
__decorate([
    Column({ default: "pending" }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Booking.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Booking.prototype, "updatedAt", void 0);
Booking = __decorate([
    Entity()
], Booking);
export { Booking };
//# sourceMappingURL=booking.model.js.map