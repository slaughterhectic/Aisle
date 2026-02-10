"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ExtractionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractionService = void 0;
const common_1 = require("@nestjs/common");
const pdfParse = require('pdf-parse');
const mammoth_1 = __importDefault(require("mammoth"));
let ExtractionService = ExtractionService_1 = class ExtractionService {
    logger = new common_1.Logger(ExtractionService_1.name);
    async extractText(buffer, mimeType) {
        switch (mimeType) {
            case 'application/pdf':
                return this.extractFromPdf(buffer);
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return this.extractFromDocx(buffer);
            case 'text/plain':
                return this.extractFromText(buffer);
            default:
                throw new Error(`Unsupported MIME type: ${mimeType}`);
        }
    }
    async extractFromPdf(buffer) {
        try {
            const data = await pdfParse(buffer);
            return data.text;
        }
        catch (error) {
            this.logger.error('Failed to extract text from PDF', error);
            throw new Error('Failed to extract text from PDF');
        }
    }
    async extractFromDocx(buffer) {
        try {
            const result = await mammoth_1.default.extractRawText({ buffer });
            return result.value;
        }
        catch (error) {
            this.logger.error('Failed to extract text from DOCX', error);
            throw new Error('Failed to extract text from DOCX');
        }
    }
    extractFromText(buffer) {
        return buffer.toString('utf-8');
    }
};
exports.ExtractionService = ExtractionService;
exports.ExtractionService = ExtractionService = ExtractionService_1 = __decorate([
    (0, common_1.Injectable)()
], ExtractionService);
//# sourceMappingURL=extraction.service.js.map