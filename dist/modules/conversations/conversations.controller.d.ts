import { ConversationsService } from './conversations.service';
import { ChatService } from './chat.service';
import { CreateConversationDto, ChatMessageDto, ConversationResponse, MessageResponse, ChatResponse, UpdateConversationDto } from './dto/conversation.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export declare class ConversationsController {
    private readonly conversationsService;
    private readonly chatService;
    constructor(conversationsService: ConversationsService, chatService: ChatService);
    create(tenant: TenantContext, dto: CreateConversationDto): Promise<ConversationResponse>;
    findAll(tenant: TenantContext): Promise<ConversationResponse[]>;
    update(tenant: TenantContext, id: string, dto: UpdateConversationDto): Promise<ConversationResponse>;
    delete(tenant: TenantContext, id: string): Promise<{
        success: boolean;
    }>;
    getMessages(tenant: TenantContext, id: string): Promise<MessageResponse[]>;
    chat(tenant: TenantContext, id: string, dto: ChatMessageDto): Promise<ChatResponse>;
}
