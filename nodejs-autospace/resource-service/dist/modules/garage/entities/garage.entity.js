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
exports.Garage = exports.GarageStatus = void 0;
const typeorm_1 = require("typeorm");
const garage_floor_entity_1 = require("./garage-floor.entity");
var GarageStatus;
(function (GarageStatus) {
    GarageStatus["PENDING"] = "pending";
    GarageStatus["ACTIVE"] = "active";
    GarageStatus["REJECTED"] = "rejected";
    GarageStatus["BLOCKED"] = "blocked";
})(GarageStatus || (exports.GarageStatus = GarageStatus = {}));
let Garage = class Garage {
};
exports.Garage = Garage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Garage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)("uuid"),
    __metadata("design:type", String)
], Garage.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], Garage.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], Garage.prototype, "garageRegistrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Garage.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        name: "contact_email",
        length: 150,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Garage.prototype, "contactEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        name: "contact_phone",
        length: 20,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Garage.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Garage.prototype, "locationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], Garage.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], Garage.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Garage.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Garage.prototype, "valetAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: GarageStatus,
        default: GarageStatus.PENDING,
    }),
    __metadata("design:type", String)
], Garage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        precision: 10,
        scale: 2,
        name: "standard_slot_price",
        default: 50,
    }),
    __metadata("design:type", Number)
], Garage.prototype, "standardSlotPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        precision: 10,
        scale: 2,
        name: "large_slot_price",
        default: 80,
    }),
    __metadata("design:type", Number)
], Garage.prototype, "largeSlotPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "time",
        name: "opening_time",
        nullable: true,
    }),
    __metadata("design:type", Object)
], Garage.prototype, "openingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "time",
        name: "closing_time",
        nullable: true,
    }),
    __metadata("design:type", Object)
], Garage.prototype, "closingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 20,
    }),
    __metadata("design:type", Number)
], Garage.prototype, "valetServiceRadius", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)("uuid"),
    __metadata("design:type", String)
], Garage.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Garage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Garage.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => garage_floor_entity_1.GarageFloor, (floor) => floor.garage),
    __metadata("design:type", Array)
], Garage.prototype, "floors", void 0);
exports.Garage = Garage = __decorate([
    (0, typeorm_1.Entity)("garages")
], Garage);
