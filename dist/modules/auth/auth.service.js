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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const user_entity_1 = require("../../database/entities/user.entity");
const tenant_entity_1 = require("../../database/entities/tenant.entity");
const tenant_context_interface_1 = require("../../common/interfaces/tenant-context.interface");
let AuthService = class AuthService {
    userRepository;
    tenantRepository;
    jwtService;
    configService;
    constructor(userRepository, tenantRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        let tenant;
        if (dto.tenantSlug) {
            const foundTenant = await this.tenantRepository.findOne({
                where: { slug: dto.tenantSlug },
            });
            if (!foundTenant) {
                throw new common_1.NotFoundException(`Tenant with slug "${dto.tenantSlug}" not found`);
            }
            tenant = foundTenant;
        }
        else {
            const tenantName = dto.tenantName || `${dto.name}'s Organization`;
            const tenantSlug = this.generateSlug(tenantName);
            const existingTenant = await this.tenantRepository.findOne({
                where: { slug: tenantSlug },
            });
            if (existingTenant) {
                throw new common_1.ConflictException(`Tenant slug "${tenantSlug}" already exists`);
            }
            tenant = this.tenantRepository.create({
                name: tenantName,
                slug: tenantSlug,
                settings: {
                    maxAssistants: 10,
                    maxStorageBytes: 1073741824,
                    monthlyTokenLimit: 1000000,
                },
            });
            await this.tenantRepository.save(tenant);
        }
        const existingUser = await this.userRepository.findOne({
            where: { tenantId: tenant.id, email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists in this tenant');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const isFirstUser = !dto.tenantSlug;
        const user = this.userRepository.create({
            tenantId: tenant.id,
            email: dto.email,
            passwordHash,
            name: dto.name,
            role: isFirstUser ? tenant_context_interface_1.UserRole.ADMIN : tenant_context_interface_1.UserRole.USER,
        });
        await this.userRepository.save(user);
        return this.generateAuthResponse(user, tenant);
    }
    async login(dto) {
        const tenant = await this.tenantRepository.findOne({
            where: { slug: dto.tenantSlug },
        });
        if (!tenant) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = await this.userRepository.findOne({
            where: { tenantId: tenant.id, email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is disabled');
        }
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
        return this.generateAuthResponse(user, tenant);
    }
    async refreshToken(dto) {
        try {
            const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: this.configService.get('jwt.secret'),
            });
            const user = await this.userRepository.findOne({
                where: { id: payload.sub, tenantId: payload.tenantId },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const tenant = await this.tenantRepository.findOne({
                where: { id: payload.tenantId },
            });
            if (!tenant) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            return this.generateAuthResponse(user, tenant);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async generateAuthResponse(user, tenant) {
        const payload = {
            sub: user.id,
            tenantId: tenant.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: this.configService.get('jwt.refreshExpiresIn') || '7d',
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: this.configService.get('jwt.expiresIn') || '1d',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: tenant.id,
                tenantName: tenant.name,
            },
        };
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50) + '-' + (0, uuid_1.v4)().substring(0, 8);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map