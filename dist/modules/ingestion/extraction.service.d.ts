export declare class ExtractionService {
    private readonly logger;
    extractText(buffer: Buffer, mimeType: string): Promise<string>;
    private extractFromPdf;
    private extractFromDocx;
    private extractFromText;
}
