import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/interfaces/tenant-context.interface';
import { CreateTenantDto, CreateUserBySuperAdminDto } from './dto/super-admin.dto';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('tenants')
  getAllTenants() {
    return this.superAdminService.getAllTenants();
  }

  @Post('tenants')
  createTenant(@Body() dto: CreateTenantDto) {
    return this.superAdminService.createTenant(dto);
  }

  @Get('users')
  getAllUsers() {
    return this.superAdminService.getAllUsers();
  }

  @Post('users')
  createUser(@Body() dto: CreateUserBySuperAdminDto) {
    return this.superAdminService.createUser(dto);
  }
}
