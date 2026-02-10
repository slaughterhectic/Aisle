import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../database/entities/user.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponse } from './dto/auth.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly tenantRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(userRepository: Repository<User>, tenantRepository: Repository<Tenant>, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refreshToken(dto: RefreshTokenDto): Promise<AuthResponse>;
    private generateAuthResponse;
    private generateSlug;
}
