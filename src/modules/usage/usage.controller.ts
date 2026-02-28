import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UsageService, UsageSummary } from './usage.service';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantContext, UserRole } from '../../common/interfaces/tenant-context.interface';

/**
 * Usage Controller
 * REST API endpoints for usage analytics.
 */
@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  /**
   * Get usage summary for the tenant
   * GET /usage/summary
   * Required role: ADMIN or MANAGER
   */
  @Get('summary')
  @Roles(UserRole.ADMIN)
  async getSummary(
    @Tenant() tenant: TenantContext,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<UsageSummary> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.usageService.getSummary(tenant, start, end);
  }

  /**
   * Get usage for a specific assistant
   * GET /usage/assistants/:id
   * Required role: ADMIN or MANAGER
   */
  @Get('assistants/:id')
  @Roles(UserRole.ADMIN)
  async getAssistantUsage(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.usageService.getAssistantUsage(tenant, id, start, end);
  }
}
