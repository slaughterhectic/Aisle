import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

/**
 * Extraction Service
 * Extracts text content from various document formats.
 */
@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  /**
   * Extract text from a document based on MIME type
   */
  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
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

  /**
   * Extract text from PDF
   */
  private async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      this.logger.error('Failed to extract text from PDF', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Extract text from DOCX
   */
  private async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      this.logger.error('Failed to extract text from DOCX', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  /**
   * Extract text from plain text file
   */
  private extractFromText(buffer: Buffer): string {
    return buffer.toString('utf-8');
  }
}
