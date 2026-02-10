import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

/**
 * Health Controller
 * Provides health check endpoint for container orchestration.
 */
@Controller()
export class HealthController {
  /**
   * Health check endpoint
   * GET /health
   */
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Root endpoint
   * GET /
   */
  @Public()
  @Get()
  root() {
    return {
      name: 'Aisle RAG SaaS Platform',
      version: '1.0.0',
      docs: '/api/docs',
    };
  }
}
