import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message, MessageRole } from '../../database/entities/message.entity';
import { CreateConversationDto, ConversationResponse, MessageResponse } from './dto/conversation.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { AssistantsService } from '../assistants/assistants.service';
import { SessionService } from './session.service';
export declare class ConversationsService {
    private readonly conversationRepository;
    private readonly messageRepository;
    private readonly assistantsService;
    private readonly sessionService;
    private readonly logger;
    constructor(conversationRepository: Repository<Conversation>, messageRepository: Repository<Message>, assistantsService: AssistantsService, sessionService: SessionService);
    create(tenant: TenantContext, dto: CreateConversationDto): Promise<ConversationResponse>;
    findAll(tenant: TenantContext): Promise<ConversationResponse[]>;
    findOne(tenant: TenantContext, id: string): Promise<Conversation>;
    getMessages(tenant: TenantContext, conversationId: string): Promise<MessageResponse[]>;
    saveMessage(tenantId: string, conversationId: string, role: MessageRole, content: string, tokensUsed?: number, model?: string, contextChunks?: any[]): Promise<Message>;
    updateTokenCount(conversationId: string, tokensUsed: number): Promise<void>;
    getRecentMessages(conversationId: string, limit?: number): Promise<Message[]>;
    private toConversationResponse;
    private toMessageResponse;
}
