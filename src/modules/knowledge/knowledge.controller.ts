import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { UploadDocumentDto, DocumentResponse } from './dto/knowledge.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantContext, UserRole } from '../../common/interfaces/tenant-context.interface';

/**
 * Knowledge Controller
 * REST API endpoints for knowledge base management.
 */
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) { }

  /**
   * Upload a document
   * POST /knowledge/upload
   * Required role: ADMIN or MANAGER
   */
  @Post('upload')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Tenant() tenant: TenantContext,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DocumentResponse> {
    return this.knowledgeService.uploadDocument(tenant, dto, file);
  }

  /**
   * List all documents
   * GET /knowledge
   * Optional query: assistantId to filter by assistant
   */
  @Get()
  async findAll(
    @Tenant() tenant: TenantContext,
    @Query('assistantId') assistantId?: string,
  ): Promise<DocumentResponse[]> {
    return this.knowledgeService.findAll(tenant, assistantId);
  }

  /**
   * Get a specific document
   * GET /knowledge/:id
   */
  @Get(':id')
  async findOne(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentResponse> {
    const doc = await this.knowledgeService.findOne(tenant, id);
    return {
      id: doc.id,
      assistantId: doc.assistantId,
      filename: doc.filename,
      mimeType: doc.mimeType,
      fileSize: Number(doc.fileSize),
      status: doc.status,
      chunkCount: doc.chunkCount,
      characterCount: doc.characterCount,
      version: doc.version,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Get document content stream
   * GET /knowledge/:id/content
   * Optional query: ?download=true
   */
  @Get(':id/content')
  async getContent(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('download') download: boolean,
    @Res() res: Response,
  ) {
    const { stream, document } = await this.knowledgeService.getDocumentStream(tenant, id);

    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${document.filename}"`,
    });

    stream.pipe(res);
  }

  /**
   * Delete a document
   * DELETE /knowledge/:id
   * Required role: ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.knowledgeService.remove(tenant, id);
  }
}
