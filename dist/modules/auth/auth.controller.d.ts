import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, AuthResponse } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponse>;
}
