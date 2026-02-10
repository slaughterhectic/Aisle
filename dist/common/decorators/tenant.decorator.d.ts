import { TenantContext } from '../interfaces/tenant-context.interface';
export declare const Tenant: (...dataOrPipes: (keyof TenantContext | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
export declare const TenantId: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const UserId: (...dataOrPipes: unknown[]) => ParameterDecorator;
