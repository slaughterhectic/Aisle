import { AssistantsService } from './assistants.service';
import { CreateAssistantDto, UpdateAssistantDto, AssistantResponse } from './dto/assistant.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export declare class AssistantsController {
    private readonly assistantsService;
    constructor(assistantsService: AssistantsService);
    create(tenant: TenantContext, dto: CreateAssistantDto): Promise<AssistantResponse>;
    findAll(tenant: TenantContext): Promise<AssistantResponse[]>;
    findOne(tenant: TenantContext, id: string): Promise<AssistantResponse>;
    update(tenant: TenantContext, id: string, dto: UpdateAssistantDto): Promise<AssistantResponse>;
    remove(tenant: TenantContext, id: string): Promise<void>;
}
