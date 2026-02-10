"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PromptBuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilderService = void 0;
const common_1 = require("@nestjs/common");
let PromptBuilderService = PromptBuilderService_1 = class PromptBuilderService {
    logger = new common_1.Logger(PromptBuilderService_1.name);
    buildPromptWithContext(systemPrompt, contextChunks, conversationHistory, userMessage) {
        const messages = [];
        let enhancedSystemPrompt = systemPrompt;
        if (contextChunks.length > 0) {
            enhancedSystemPrompt += `\n\n---\n\nUse the following relevant information to help answer the user's question:\n\n`;
            contextChunks.forEach((chunk, index) => {
                enhancedSystemPrompt += `[Source ${index + 1}]:\n${chunk}\n\n`;
            });
            enhancedSystemPrompt += `---\n\nProvide accurate answers based on the context above. If the context doesn't contain relevant information, say so and provide the best answer you can.`;
        }
        messages.push({ role: 'system', content: enhancedSystemPrompt });
        for (const msg of conversationHistory) {
            if (msg.role !== 'system') {
                messages.push(msg);
            }
        }
        messages.push({ role: 'user', content: userMessage });
        return messages;
    }
    estimateTokens(messages) {
        let total = 0;
        for (const msg of messages) {
            total += Math.ceil(msg.content.length / 4) + 4;
        }
        return total;
    }
    truncateToFit(messages, maxTokens) {
        const result = [];
        let tokenCount = 0;
        const systemMsg = messages.find((m) => m.role === 'system');
        if (systemMsg) {
            result.push(systemMsg);
            tokenCount += this.estimateTokens([systemMsg]);
        }
        const lastUserMsg = messages.filter((m) => m.role === 'user').pop();
        if (lastUserMsg) {
            tokenCount += this.estimateTokens([lastUserMsg]);
        }
        const conversationMsgs = messages.filter((m) => m.role !== 'system' && m !== lastUserMsg);
        const fittingMsgs = [];
        for (const msg of conversationMsgs.reverse()) {
            const msgTokens = this.estimateTokens([msg]);
            if (tokenCount + msgTokens <= maxTokens) {
                fittingMsgs.unshift(msg);
                tokenCount += msgTokens;
            }
            else {
                break;
            }
        }
        result.push(...fittingMsgs);
        if (lastUserMsg) {
            result.push(lastUserMsg);
        }
        return result;
    }
};
exports.PromptBuilderService = PromptBuilderService;
exports.PromptBuilderService = PromptBuilderService = PromptBuilderService_1 = __decorate([
    (0, common_1.Injectable)()
], PromptBuilderService);
//# sourceMappingURL=prompt-builder.service.js.map