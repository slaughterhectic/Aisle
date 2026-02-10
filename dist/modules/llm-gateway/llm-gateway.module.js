"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const llm_gateway_service_1 = require("./llm-gateway.service");
const openai_provider_1 = require("./providers/openai.provider");
const anthropic_provider_1 = require("./providers/anthropic.provider");
const prompt_builder_service_1 = require("./prompt-builder.service");
let LlmGatewayModule = class LlmGatewayModule {
};
exports.LlmGatewayModule = LlmGatewayModule;
exports.LlmGatewayModule = LlmGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [llm_gateway_service_1.LlmGatewayService, openai_provider_1.OpenAIProvider, anthropic_provider_1.AnthropicProvider, prompt_builder_service_1.PromptBuilderService],
        exports: [llm_gateway_service_1.LlmGatewayService, prompt_builder_service_1.PromptBuilderService],
    })
], LlmGatewayModule);
//# sourceMappingURL=llm-gateway.module.js.map