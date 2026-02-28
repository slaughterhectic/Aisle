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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessRequestsController = void 0;
const common_1 = require("@nestjs/common");
const access_requests_service_1 = require("./access-requests.service");
const access_request_dto_1 = require("./dto/access-request.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_decorator_1 = require("../../common/decorators/tenant.decorator");
const tenant_context_interface_1 = require("../../common/interfaces/tenant-context.interface");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let AccessRequestsController = class AccessRequestsController {
    accessRequestsService;
    constructor(accessRequestsService) {
        this.accessRequestsService = accessRequestsService;
    }
    async requestAccess(dto) {
        return this.accessRequestsService.create(dto);
    }
    async getPublicTenants() {
        return this.accessRequestsService.getPublicTenants();
    }
    async getAdminRequests(tenant) {
        return this.accessRequestsService.findPendingForTenant(tenant.tenantId);
    }
    async adminApprove(tenant, id, dto) {
        return this.accessRequestsService.approve(id, tenant.userId, tenant.role, tenant.tenantId, dto);
    }
    async adminReject(tenant, id) {
        return this.accessRequestsService.reject(id, tenant.userId, tenant.role, tenant.tenantId);
    }
    async getSuperAdminRequests() {
        return this.accessRequestsService.findAllPending();
    }
    async superAdminApprove(tenant, id, dto) {
        return this.accessRequestsService.approve(id, tenant.userId, tenant.role, tenant.tenantId, dto);
    }
    async superAdminReject(tenant, id) {
        return this.accessRequestsService.reject(id, tenant.userId, tenant.role, tenant.tenantId);
    }
};
exports.AccessRequestsController = AccessRequestsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('auth/request-access'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [access_request_dto_1.CreateAccessRequestDto]),
    __metadata("design:returntype", Promise)
], AccessRequestsController.prototype, "requestAccess", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('auth/tenants'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AccessRequestsController.prototype, "getPublicTenants", null);
__decorate([
    (0, common_1.Get)('admin/access-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessRequestsController.prototype, "getAdminRequests", null);
__decorate([
    (0, common_1.Post)('admin/access-requests/:id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, access_request_dto_1.ApproveAccessRequestDto]),
    __metadata("design:returntype", Promise)
], AccessRequestsController.prototype, "adminApprove", null);
__decorate([
    (0, common_1.Post)('admin/access-requests/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccessRequestsController.prototype, "adminReject", null);
__decorate([
    (0, common_1.Get)('super-admin/access-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AccessRequestsController.prototype, "getSuperAdminRequests", null);
__decorate([
    (0, common_1.Post)('super-admin/access-requests/:id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.SUPER_ADMIN),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, access_request_dto_1.ApproveAccessRequestDto]),
    __metadata("design:returntype", Promise)
], AccessRequestsController.prototype, "superAdminApprove", null);
__decorate([
    (0, common_1.Post)('super-admin/access-requests/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.SUPER_ADMIN),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccessRequestsController.prototype, "superAdminReject", null);
exports.AccessRequestsController = AccessRequestsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [access_requests_service_1.AccessRequestsService])
], AccessRequestsController);
//# sourceMappingURL=access-requests.controller.js.map