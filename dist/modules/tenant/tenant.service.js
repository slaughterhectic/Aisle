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
var TenantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../../database/entities/tenant.entity");
const storage_service_1 = require("../knowledge/storage.service");
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_LOGO_SIZE = 5 * 1024 * 1024;
let TenantService = TenantService_1 = class TenantService {
    tenantRepo;
    storageService;
    logger = new common_1.Logger(TenantService_1.name);
    constructor(tenantRepo, storageService) {
        this.tenantRepo = tenantRepo;
        this.storageService = storageService;
    }
    async getTenantInfo(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            logoUrl: tenant.settings?.branding?.logoUrl || null,
            createdAt: tenant.createdAt,
        };
    }
    async uploadLogo(tenant, file) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid image type. Allowed: PNG, JPEG, WebP, SVG');
        }
        if (file.size > MAX_LOGO_SIZE) {
            throw new common_1.BadRequestException('Logo too large. Maximum size: 5MB');
        }
        const tenantEntity = await this.tenantRepo.findOne({ where: { id: tenant.tenantId } });
        if (!tenantEntity) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const oldLogoKey = tenantEntity.settings?.branding?.logoUrl;
        if (oldLogoKey) {
            try {
                await this.storageService.deleteFile(oldLogoKey);
            }
            catch (err) {
                this.logger.warn(`Failed to delete old logo: ${oldLogoKey}`);
            }
        }
        const s3Key = `logos/${tenant.tenantId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        await this.storageService.uploadFile(s3Key, file.buffer, file.mimetype);
        const settings = tenantEntity.settings || {};
        settings.branding = { ...settings.branding, logoUrl: s3Key };
        tenantEntity.settings = settings;
        await this.tenantRepo.save(tenantEntity);
        this.logger.log(`Logo uploaded for tenant ${tenant.tenantId}: ${s3Key}`);
        return { logoUrl: s3Key, message: 'Logo uploaded successfully' };
    }
    async getLogoStream(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant || !tenant.settings?.branding?.logoUrl) {
            return null;
        }
        const s3Key = tenant.settings.branding.logoUrl;
        const stream = await this.storageService.getFileStream(s3Key);
        const ext = s3Key.split('.').pop()?.toLowerCase();
        const mimeMap = {
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            webp: 'image/webp',
            svg: 'image/svg+xml',
        };
        return {
            stream,
            mimeType: mimeMap[ext || ''] || 'image/png',
        };
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = TenantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        storage_service_1.StorageService])
], TenantService);
//# sourceMappingURL=tenant.service.js.map