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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../../database/entities/user.entity");
const tenant_entity_1 = require("../../database/entities/tenant.entity");
let SuperAdminService = class SuperAdminService {
    userRepository;
    tenantRepository;
    constructor(userRepository, tenantRepository) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }
    async createTenant(dto) {
        const existing = await this.tenantRepository.findOne({ where: { slug: dto.slug } });
        if (existing) {
            throw new common_1.ConflictException('Tenant with this slug already exists');
        }
        const tenant = this.tenantRepository.create({
            name: dto.name,
            slug: dto.slug,
            settings: {},
            isActive: true,
        });
        return this.tenantRepository.save(tenant);
    }
    async getAllTenants() {
        return this.tenantRepository.find({ order: { createdAt: 'DESC' } });
    }
    async createUser(dto) {
        let tenantId = dto.tenantId;
        if (!tenantId) {
            if (dto.newTenantName && dto.newTenantSlug) {
                const newTenant = await this.createTenant({
                    name: dto.newTenantName,
                    slug: dto.newTenantSlug,
                });
                tenantId = newTenant.id;
            }
            else {
                throw new common_1.BadRequestException('Provide either tenantId or newTenantName/Slug');
            }
        }
        else {
            const existingTenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
            if (!existingTenant) {
                throw new common_1.NotFoundException('Tenant not found');
            }
        }
        const existingUser = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email already exists. Each email can only be associated with one account.');
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(dto.password, salt);
        const user = this.userRepository.create({
            tenantId,
            email: dto.email,
            name: dto.name,
            passwordHash,
            role: dto.role,
            isActive: true,
        });
        return this.userRepository.save(user);
    }
    async getAllUsers() {
        return this.userRepository.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map