import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmGatewayService } from './llm-gateway.service';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { PromptBuilderService } from './prompt-builder.service';

/**
 * LLM Gateway Module
 * Abstracts multiple LLM providers behind a unified interface.
 */
@Module({
  imports: [ConfigModule],
  providers: [LlmGatewayService, OpenAIProvider, AnthropicProvider, PromptBuilderService],
  exports: [LlmGatewayService, PromptBuilderService],
})
export class LlmGatewayModule {}
