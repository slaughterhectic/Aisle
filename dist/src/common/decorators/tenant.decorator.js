"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserId = exports.TenantId = exports.Tenant = void 0;
const common_1 = require("@nestjs/common");
exports.Tenant = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (data) {
        return user[data];
    }
    return user;
});
exports.TenantId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId;
});
exports.UserId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId;
});
//# sourceMappingURL=tenant.decorator.js.map