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
exports.UsageController = void 0;
const common_1 = require("@nestjs/common");
const usage_service_1 = require("./usage.service");
const tenant_decorator_1 = require("../../common/decorators/tenant.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_context_interface_1 = require("../../common/interfaces/tenant-context.interface");
let UsageController = class UsageController {
    usageService;
    constructor(usageService) {
        this.usageService = usageService;
    }
    async getSummary(tenant, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.usageService.getSummary(tenant, start, end);
    }
    async getAssistantUsage(tenant, id, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.usageService.getAssistantUsage(tenant, id, start, end);
    }
};
exports.UsageController = UsageController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN, tenant_context_interface_1.UserRole.MANAGER),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsageController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('assistants/:id'),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN, tenant_context_interface_1.UserRole.MANAGER),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], UsageController.prototype, "getAssistantUsage", null);
exports.UsageController = UsageController = __decorate([
    (0, common_1.Controller)('usage'),
    __metadata("design:paramtypes", [usage_service_1.UsageService])
], UsageController);
//# sourceMappingURL=usage.controller.js.map