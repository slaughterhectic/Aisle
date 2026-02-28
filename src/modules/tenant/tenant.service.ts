import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantSettings } from '../../database/entities/tenant.entity';
import { StorageService } from '../knowledge/storage.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { Readable } from 'stream';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class TenantService {
    private readonly logger = new Logger(TenantService.name);

    constructor(
        @InjectRepository(Tenant)
        private readonly tenantRepo: Repository<Tenant>,
        private readonly storageService: StorageService,
    ) { }

    /**
     * Get tenant info for the current user's tenant
     */
    async getTenantInfo(tenantId: string) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            logoUrl: tenant.settings?.branding?.logoUrl || null,
            createdAt: tenant.createdAt,
        };
    }

    /**
     * Upload organization logo (admin only)
     */
    async uploadLogo(tenant: TenantContext, file: Express.Multer.File) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            throw new BadRequestException('Invalid image type. Allowed: PNG, JPEG, WebP, SVG');
        }
        if (file.size > MAX_LOGO_SIZE) {
            throw new BadRequestException('Logo too large. Maximum size: 5MB');
        }

        const tenantEntity = await this.tenantRepo.findOne({ where: { id: tenant.tenantId } });
        if (!tenantEntity) {
            throw new NotFoundException('Tenant not found');
        }

        // Delete old logo if exists
        const oldLogoKey = tenantEntity.settings?.branding?.logoUrl;
        if (oldLogoKey) {
            try {
                await this.storageService.deleteFile(oldLogoKey);
            } catch (err) {
                this.logger.warn(`Failed to delete old logo: ${oldLogoKey}`);
            }
        }

        // Upload new logo
        const s3Key = `logos/${tenant.tenantId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        await this.storageService.uploadFile(s3Key, file.buffer, file.mimetype);

        // Update tenant settings
        const settings: TenantSettings = tenantEntity.settings || {};
        settings.branding = { ...settings.branding, logoUrl: s3Key };
        tenantEntity.settings = settings;
        await this.tenantRepo.save(tenantEntity);

        this.logger.log(`Logo uploaded for tenant ${tenant.tenantId}: ${s3Key}`);
        return { logoUrl: s3Key, message: 'Logo uploaded successfully' };
    }

    /**
     * Get logo stream for a tenant
     */
    async getLogoStream(tenantId: string): Promise<{ stream: Readable; mimeType: string } | null> {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant || !tenant.settings?.branding?.logoUrl) {
            return null;
        }

        const s3Key = tenant.settings.branding.logoUrl;
        const stream = await this.storageService.getFileStream(s3Key);

        // Infer mime type from key
        const ext = s3Key.split('.').pop()?.toLowerCase();
        const mimeMap: Record<string, string> = {
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
}
