import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssistantsService } from './assistants.service';
import { CreateAssistantDto, UpdateAssistantDto, AssistantResponse } from './dto/assistant.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantContext, UserRole } from '../../common/interfaces/tenant-context.interface';

/**
 * Assistants Controller
 * REST API endpoints for assistant management.
 */
@Controller('assistants')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  /**
   * Create a new assistant
   * POST /assistants
   * Required role: ADMIN or MANAGER
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Tenant() tenant: TenantContext,
    @Body() dto: CreateAssistantDto,
  ): Promise<AssistantResponse> {
    return this.assistantsService.create(tenant, dto);
  }

  /**
   * List all assistants for the tenant
   * GET /assistants
   */
  @Get()
  async findAll(@Tenant() tenant: TenantContext): Promise<AssistantResponse[]> {
    return this.assistantsService.findAll(tenant);
  }

  /**
   * Get a specific assistant
   * GET /assistants/:id
   */
  @Get(':id')
  async findOne(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AssistantResponse> {
    return this.assistantsService.findOne(tenant, id);
  }

  /**
   * Update an assistant
   * PATCH /assistants/:id
   * Required role: ADMIN or MANAGER
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssistantDto,
  ): Promise<AssistantResponse> {
    return this.assistantsService.update(tenant, id, dto);
  }

  /**
   * Delete an assistant
   * DELETE /assistants/:id
   * Required role: ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.assistantsService.remove(tenant, id);
  }
}
