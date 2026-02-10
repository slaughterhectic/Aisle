import { ConversationsService } from './conversations.service';
import { SessionService } from './session.service';
import { AssistantsService } from '../assistants/assistants.service';
import { VectorSearchService } from '../vector-search/vector-search.service';
import { LlmGatewayService } from '../llm-gateway/llm-gateway.service';
import { UsageService } from '../usage/usage.service';
import { ChatMessageDto, ChatResponse } from './dto/conversation.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export declare class ChatService {
    private readonly conversationsService;
    private readonly sessionService;
    private readonly assistantsService;
    private readonly vectorSearchService;
    private readonly llmGatewayService;
    private readonly usageService;
    private readonly logger;
    constructor(conversationsService: ConversationsService, sessionService: SessionService, assistantsService: AssistantsService, vectorSearchService: VectorSearchService, llmGatewayService: LlmGatewayService, usageService: UsageService);
    chat(tenant: TenantContext, conversationId: string, dto: ChatMessageDto): Promise<ChatResponse>;
    private buildRagContext;
    private buildPromptMessages;
}
