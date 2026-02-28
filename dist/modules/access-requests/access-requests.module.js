"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const access_requests_controller_1 = require("./access-requests.controller");
const access_requests_service_1 = require("./access-requests.service");
const access_request_entity_1 = require("../../database/entities/access-request.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const tenant_entity_1 = require("../../database/entities/tenant.entity");
let AccessRequestsModule = class AccessRequestsModule {
};
exports.AccessRequestsModule = AccessRequestsModule;
exports.AccessRequestsModule = AccessRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([access_request_entity_1.AccessRequest, user_entity_1.User, tenant_entity_1.Tenant]), jwt_1.JwtModule],
        controllers: [access_requests_controller_1.AccessRequestsController],
        providers: [access_requests_service_1.AccessRequestsService],
        exports: [access_requests_service_1.AccessRequestsService],
    })
], AccessRequestsModule);
//# sourceMappingURL=access-requests.module.js.map