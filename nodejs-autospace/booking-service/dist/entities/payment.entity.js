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
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (PaymentStatus = {}));
let Payment = class Payment {
    id;
    bookingId;
    userId;
    // DB is INTEGER → use int here
    amount;
    currency;
    // DB is varchar, NOT enum
    status;
    stripePaymentIntentId;
    stripeChargeId;
    failureReason;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    Column({ name: "booking_id", type: "uuid" }),
    __metadata("design:type", String)
], Payment.prototype, "bookingId", void 0);
__decorate([
    Column({ name: "user_id", type: "uuid" }),
    __metadata("design:type", String)
], Payment.prototype, "userId", void 0);
__decorate([
    Column({ type: "int" }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    Column({ type: "varchar", length: 10, default: "INR" }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    Column({ type: "varchar", length: 20, default: "PENDING" }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    Column({ name: "stripe_payment_intent_id", type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "stripePaymentIntentId", void 0);
__decorate([
    Column({ name: "stripe_charge_id", type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "stripeChargeId", void 0);
__decorate([
    Column({ name: "failure_reason", type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "failureReason", void 0);
__decorate([
    CreateDateColumn({ name: "created_at" }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: "updated_at" }),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
Payment = __decorate([
    Entity({ name: "payments" })
], Payment);
export { Payment };
//# sourceMappingURL=payment.entity.js.map