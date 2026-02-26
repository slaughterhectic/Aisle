"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const super_admin_controller_1 = require("./super-admin.controller");
const super_admin_service_1 = require("./super-admin.service");
const tenant_entity_1 = require("../../database/entities/tenant.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
let SuperAdminModule = class SuperAdminModule {
};
exports.SuperAdminModule = SuperAdminModule;
exports.SuperAdminModule = SuperAdminModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant, user_entity_1.User]), jwt_1.JwtModule],
        controllers: [super_admin_controller_1.SuperAdminController],
        providers: [super_admin_service_1.SuperAdminService],
        exports: [super_admin_service_1.SuperAdminService],
    })
], SuperAdminModule);
//# sourceMappingURL=super-admin.module.js.map