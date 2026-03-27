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
exports.GarageFloor = void 0;
const typeorm_1 = require("typeorm");
const garage_entity_1 = require("./garage.entity");
const garage_slot_entity_1 = require("./garage-slot.entity");
let GarageFloor = class GarageFloor {
};
exports.GarageFloor = GarageFloor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], GarageFloor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", name: "garage_id" }),
    __metadata("design:type", String)
], GarageFloor.prototype, "garageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => garage_entity_1.Garage, (garage) => garage.floors, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "garage_id" }),
    __metadata("design:type", garage_entity_1.Garage)
], GarageFloor.prototype, "garage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", name: "floor_number" }),
    __metadata("design:type", Number)
], GarageFloor.prototype, "floorNumber", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => garage_slot_entity_1.GarageSlot, (slot) => slot.floor),
    __metadata("design:type", Array)
], GarageFloor.prototype, "slots", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], GarageFloor.prototype, "createdAt", void 0);
exports.GarageFloor = GarageFloor = __decorate([
    (0, typeorm_1.Entity)("garage_floors")
], GarageFloor);
