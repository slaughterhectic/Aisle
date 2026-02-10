import { Repository } from 'typeorm';
import { Assistant } from '../../database/entities/assistant.entity';
import { CreateAssistantDto, UpdateAssistantDto, AssistantResponse } from './dto/assistant.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export declare class AssistantsService {
    private readonly assistantRepository;
    constructor(assistantRepository: Repository<Assistant>);
    create(tenant: TenantContext, dto: CreateAssistantDto): Promise<AssistantResponse>;
    findAll(tenant: TenantContext): Promise<AssistantResponse[]>;
    findOne(tenant: TenantContext, id: string): Promise<AssistantResponse>;
    findOneEntity(tenantId: string, id: string): Promise<Assistant>;
    update(tenant: TenantContext, id: string, dto: UpdateAssistantDto): Promise<AssistantResponse>;
    remove(tenant: TenantContext, id: string): Promise<void>;
    private toResponse;
}
