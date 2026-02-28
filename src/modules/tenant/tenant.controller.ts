import {
    Controller,
    Get,
    Post,
    Param,
    Res,
    UseInterceptors,
    UploadedFile,
    ParseUUIDPipe,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { TenantService } from './tenant.service';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { TenantContext, UserRole } from '../../common/interfaces/tenant-context.interface';

@Controller('tenant')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    /**
     * Get current tenant info
     * GET /tenant/info
     */
    @Get('info')
    async getTenantInfo(@Tenant() tenant: TenantContext) {
        return this.tenantService.getTenantInfo(tenant.tenantId);
    }

    /**
     * Upload organization logo (admin only)
     * POST /tenant/logo
     */
    @Post('logo')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('logo'))
    async uploadLogo(
        @Tenant() tenant: TenantContext,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.tenantService.uploadLogo(tenant, file);
    }

    /**
     * Serve tenant logo image (public, for display)
     * GET /tenant/logo/:tenantId
     */
    @Public()
    @Get('logo/:tenantId')
    async getLogo(
        @Param('tenantId', ParseUUIDPipe) tenantId: string,
        @Res() res: Response,
    ) {
        const result = await this.tenantService.getLogoStream(tenantId);
        if (!result) {
            return res.status(HttpStatus.NOT_FOUND).json({ message: 'No logo found' });
        }

        res.set({
            'Content-Type': result.mimeType,
            'Cache-Control': 'public, max-age=3600',
        });
        result.stream.pipe(res);
    }
}
