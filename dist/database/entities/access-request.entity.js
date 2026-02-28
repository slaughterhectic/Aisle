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
exports.AccessRequest = exports.AccessRequestStatus = void 0;
const typeorm_1 = require("typeorm");
var AccessRequestStatus;
(function (AccessRequestStatus) {
    AccessRequestStatus["PENDING"] = "pending";
    AccessRequestStatus["APPROVED"] = "approved";
    AccessRequestStatus["REJECTED"] = "rejected";
})(AccessRequestStatus || (exports.AccessRequestStatus = AccessRequestStatus = {}));
let AccessRequest = class AccessRequest {
    id;
    name;
    email;
    message;
    tenantId;
    newTenantName;
    status;
    reviewedBy;
    reviewedAt;
    createdAt;
};
exports.AccessRequest = AccessRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AccessRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], AccessRequest.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AccessRequest.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AccessRequest.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], AccessRequest.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], AccessRequest.prototype, "newTenantName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AccessRequestStatus,
        default: AccessRequestStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AccessRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], AccessRequest.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], AccessRequest.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AccessRequest.prototype, "createdAt", void 0);
exports.AccessRequest = AccessRequest = __decorate([
    (0, typeorm_1.Entity)('access_requests')
], AccessRequest);
//# sourceMappingURL=access-request.entity.js.map