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
exports.AssistantsController = void 0;
const common_1 = require("@nestjs/common");
const assistants_service_1 = require("./assistants.service");
const assistant_dto_1 = require("./dto/assistant.dto");
const tenant_decorator_1 = require("../../common/decorators/tenant.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_context_interface_1 = require("../../common/interfaces/tenant-context.interface");
let AssistantsController = class AssistantsController {
    assistantsService;
    constructor(assistantsService) {
        this.assistantsService = assistantsService;
    }
    async create(tenant, dto) {
        return this.assistantsService.create(tenant, dto);
    }
    async findAll(tenant) {
        return this.assistantsService.findAll(tenant);
    }
    async findOne(tenant, id) {
        return this.assistantsService.findOne(tenant, id);
    }
    async update(tenant, id, dto) {
        return this.assistantsService.update(tenant, id, dto);
    }
    async remove(tenant, id) {
        return this.assistantsService.remove(tenant, id);
    }
};
exports.AssistantsController = AssistantsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, assistant_dto_1.CreateAssistantDto]),
    __metadata("design:returntype", Promise)
], AssistantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssistantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AssistantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, assistant_dto_1.UpdateAssistantDto]),
    __metadata("design:returntype", Promise)
], AssistantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AssistantsController.prototype, "remove", null);
exports.AssistantsController = AssistantsController = __decorate([
    (0, common_1.Controller)('assistants'),
    __metadata("design:paramtypes", [assistants_service_1.AssistantsService])
], AssistantsController);
//# sourceMappingURL=assistants.controller.js.map