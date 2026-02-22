import { Tenant } from './tenant.entity';
import { Assistant } from './assistant.entity';
import { User } from './user.entity';
import { Message } from './message.entity';
export declare class Conversation {
    id: string;
    tenantId: string;
    tenant: Tenant;
    assistantId: string;
    assistant: Assistant;
    userId: string;
    user: User;
    title: string;
    summary: string;
    totalTokensUsed: number;
    isActive: boolean;
    isPinned: boolean;
    isArchived: boolean;
    messages: Message[];
    createdAt: Date;
}
