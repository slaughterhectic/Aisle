import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assistant } from '../../database/entities/assistant.entity';
import { CreateAssistantDto, UpdateAssistantDto, AssistantResponse } from './dto/assistant.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

/**
 * Assistants Service
 * Manages AI assistant CRUD operations with tenant isolation.
 */
@Injectable()
export class AssistantsService {
  constructor(
    @InjectRepository(Assistant)
    private readonly assistantRepository: Repository<Assistant>,
  ) {}

  /**
   * Create a new assistant
   * CRITICAL: tenantId is enforced at creation
   */
  async create(tenant: TenantContext, dto: CreateAssistantDto): Promise<AssistantResponse> {
    const assistant = this.assistantRepository.create({
      ...dto,
      tenantId: tenant.tenantId, // ENFORCE tenant isolation
    });

    const saved = await this.assistantRepository.save(assistant);
    return this.toResponse(saved);
  }

  /**
   * Get all assistants for tenant
   * CRITICAL: Always filter by tenantId
   */
  async findAll(tenant: TenantContext): Promise<AssistantResponse[]> {
    const assistants = await this.assistantRepository.find({
      where: { tenantId: tenant.tenantId }, // ENFORCE tenant isolation
      order: { createdAt: 'DESC' },
    });

    return assistants.map((a) => this.toResponse(a));
  }

  /**
   * Get a specific assistant by ID
   * CRITICAL: Verify tenant ownership
   */
  async findOne(tenant: TenantContext, id: string): Promise<AssistantResponse> {
    const assistant = await this.assistantRepository.findOne({
      where: { id, tenantId: tenant.tenantId }, // ENFORCE tenant isolation
    });

    if (!assistant) {
      throw new NotFoundException(`Assistant with ID "${id}" not found`);
    }

    return this.toResponse(assistant);
  }

  /**
   * Get assistant entity (for internal use)
   */
  async findOneEntity(tenantId: string, id: string): Promise<Assistant> {
    const assistant = await this.assistantRepository.findOne({
      where: { id, tenantId },
    });

    if (!assistant) {
      throw new NotFoundException(`Assistant with ID "${id}" not found`);
    }

    return assistant;
  }

  /**
   * Update an assistant
   * CRITICAL: Verify tenant ownership before update
   */
  async update(tenant: TenantContext, id: string, dto: UpdateAssistantDto): Promise<AssistantResponse> {
    const assistant = await this.findOneEntity(tenant.tenantId, id);

    // Apply updates
    Object.assign(assistant, dto);
    
    const saved = await this.assistantRepository.save(assistant);
    return this.toResponse(saved);
  }

  /**
   * Delete an assistant
   * CRITICAL: Verify tenant ownership before delete
   */
  async remove(tenant: TenantContext, id: string): Promise<void> {
    const assistant = await this.findOneEntity(tenant.tenantId, id);
    await this.assistantRepository.remove(assistant);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponse(assistant: Assistant): AssistantResponse {
    return {
      id: assistant.id,
      name: assistant.name,
      description: assistant.description,
      systemPrompt: assistant.systemPrompt,
      provider: assistant.provider,
      model: assistant.model,
      temperature: Number(assistant.temperature),
      maxTokens: assistant.maxTokens,
      ragEnabled: assistant.ragEnabled,
      ragTopK: assistant.ragTopK,
      isActive: assistant.isActive,
      createdAt: assistant.createdAt,
      updatedAt: assistant.updatedAt,
    };
  }
}
