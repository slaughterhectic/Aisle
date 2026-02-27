"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AccessRequestsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const access_request_entity_1 = require("../../database/entities/access-request.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const tenant_entity_1 = require("../../database/entities/tenant.entity");
const tenant_context_interface_1 = require("../../common/interfaces/tenant-context.interface");
let AccessRequestsService = AccessRequestsService_1 = class AccessRequestsService {
    accessRequestRepo;
    userRepo;
    tenantRepo;
    logger = new common_1.Logger(AccessRequestsService_1.name);
    constructor(accessRequestRepo, userRepo, tenantRepo) {
        this.accessRequestRepo = accessRequestRepo;
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
    }
    async create(dto) {
        if (dto.tenantId) {
            const tenant = await this.tenantRepo.findOne({ where: { id: dto.tenantId } });
            if (!tenant) {
                throw new common_1.NotFoundException('The selected organization was not found');
            }
        }
        const existing = await this.accessRequestRepo.findOne({
            where: { email: dto.email, status: access_request_entity_1.AccessRequestStatus.PENDING },
        });
        if (existing) {
            throw new common_1.ConflictException('You already have a pending access request. Please wait for it to be reviewed.');
        }
        const request = this.accessRequestRepo.create({
            name: dto.name,
            email: dto.email,
            message: dto.message || null,
            tenantId: dto.tenantId || null,
            newTenantName: dto.newTenantName || null,
            status: access_request_entity_1.AccessRequestStatus.PENDING,
        });
        const saved = await this.accessRequestRepo.save(request);
        return this.toResponse(saved);
    }
    async findPendingForTenant(tenantId) {
        const requests = await this.accessRequestRepo.find({
            where: { tenantId, status: access_request_entity_1.AccessRequestStatus.PENDING },
            order: { createdAt: 'DESC' },
        });
        return Promise.all(requests.map((r) => this.toResponse(r)));
    }
    async findAllPending() {
        const requests = await this.accessRequestRepo.find({
            where: { status: access_request_entity_1.AccessRequestStatus.PENDING },
            order: { createdAt: 'DESC' },
        });
        return Promise.all(requests.map((r) => this.toResponse(r)));
    }
    async approve(requestId, reviewerId, reviewerRole, reviewerTenantId, dto) {
        const request = await this.accessRequestRepo.findOne({ where: { id: requestId } });
        if (!request) {
            throw new common_1.NotFoundException('Access request not found');
        }
        if (request.status !== access_request_entity_1.AccessRequestStatus.PENDING) {
            throw new common_1.BadRequestException('This request has already been reviewed');
        }
        let targetTenantId;
        if (request.tenantId) {
            if (reviewerRole === tenant_context_interface_1.UserRole.ADMIN && request.tenantId !== reviewerTenantId) {
                throw new common_1.BadRequestException('You can only approve requests for your own tenant');
            }
            targetTenantId = request.tenantId;
        }
        else if (request.newTenantName) {
            if (reviewerRole !== tenant_context_interface_1.UserRole.SUPER_ADMIN) {
                throw new common_1.BadRequestException('Only super admins can approve requests for new tenants');
            }
            const slug = this.generateSlug(request.newTenantName);
            const existingTenant = await this.tenantRepo.findOne({ where: { slug } });
            if (existingTenant) {
                throw new common_1.ConflictException(`Tenant slug "${slug}" already exists`);
            }
            const newTenant = this.tenantRepo.create({
                name: request.newTenantName,
                slug,
                settings: { maxAssistants: 10, monthlyTokenLimit: 1000000 },
                isActive: true,
            });
            const saved = await this.tenantRepo.save(newTenant);
            targetTenantId = saved.id;
        }
        else {
            targetTenantId = reviewerTenantId;
        }
        const existingUser = await this.userRepo.findOne({
            where: { email: request.email, tenantId: targetTenantId },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email already exists in the target tenant');
        }
        const userRole = (request.newTenantName && reviewerRole === tenant_context_interface_1.UserRole.SUPER_ADMIN)
            ? tenant_context_interface_1.UserRole.ADMIN
            : tenant_context_interface_1.UserRole.USER;
        const tempPassword = dto?.password || this.generateTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        const user = this.userRepo.create({
            tenantId: targetTenantId,
            email: request.email,
            name: request.name,
            passwordHash,
            role: userRole,
            isActive: true,
        });
        await this.userRepo.save(user);
        request.status = access_request_entity_1.AccessRequestStatus.APPROVED;
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date();
        await this.accessRequestRepo.save(request);
        this.logger.log(`Access request ${requestId} approved. User ${request.email} created as ${userRole}`);
        return { message: `User ${request.email} has been approved and created as ${userRole}. Temporary password: ${tempPassword}` };
    }
    async reject(requestId, reviewerId, reviewerRole, reviewerTenantId) {
        const request = await this.accessRequestRepo.findOne({ where: { id: requestId } });
        if (!request) {
            throw new common_1.NotFoundException('Access request not found');
        }
        if (request.status !== access_request_entity_1.AccessRequestStatus.PENDING) {
            throw new common_1.BadRequestException('This request has already been reviewed');
        }
        if (reviewerRole === tenant_context_interface_1.UserRole.ADMIN && request.tenantId !== reviewerTenantId) {
            throw new common_1.BadRequestException('You can only reject requests for your own tenant');
        }
        request.status = access_request_entity_1.AccessRequestStatus.REJECTED;
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date();
        await this.accessRequestRepo.save(request);
        return { message: `Access request from ${request.email} has been rejected` };
    }
    async getPublicTenants() {
        const tenants = await this.tenantRepo.find({
            where: { isActive: true },
            select: ['id', 'name'],
            order: { name: 'ASC' },
        });
        return tenants.filter((t) => t.name !== 'System Administration');
    }
    async toResponse(request) {
        let tenantName = null;
        if (request.tenantId) {
            const tenant = await this.tenantRepo.findOne({ where: { id: request.tenantId } });
            tenantName = tenant?.name || null;
        }
        return {
            id: request.id,
            name: request.name,
            email: request.email,
            message: request.message,
            tenantId: request.tenantId,
            tenantName,
            newTenantName: request.newTenantName,
            status: request.status,
            reviewedBy: request.reviewedBy,
            reviewedAt: request.reviewedAt,
            createdAt: request.createdAt,
        };
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50) + '-' + (0, uuid_1.v4)().substring(0, 8);
    }
    generateTempPassword() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};
exports.AccessRequestsService = AccessRequestsService;
exports.AccessRequestsService = AccessRequestsService = AccessRequestsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(access_request_entity_1.AccessRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AccessRequestsService);
//# sourceMappingURL=access-requests.service.js.map