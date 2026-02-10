import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponse } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponse>;
}
