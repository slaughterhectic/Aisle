"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const assistants_controller_1 = require("./assistants.controller");
const assistants_service_1 = require("./assistants.service");
const assistant_entity_1 = require("../../database/entities/assistant.entity");
let AssistantsModule = class AssistantsModule {
};
exports.AssistantsModule = AssistantsModule;
exports.AssistantsModule = AssistantsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([assistant_entity_1.Assistant])],
        controllers: [assistants_controller_1.AssistantsController],
        providers: [assistants_service_1.AssistantsService],
        exports: [assistants_service_1.AssistantsService],
    })
], AssistantsModule);
//# sourceMappingURL=assistants.module.js.map