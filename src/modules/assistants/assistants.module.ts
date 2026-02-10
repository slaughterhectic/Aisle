import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssistantsController } from './assistants.controller';
import { AssistantsService } from './assistants.service';
import { Assistant } from '../../database/entities/assistant.entity';

/**
 * Assistant Management Module
 * Handles creation, configuration, and management of AI assistants.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Assistant])],
  controllers: [AssistantsController],
  providers: [AssistantsService],
  exports: [AssistantsService],
})
export class AssistantsModule {}
