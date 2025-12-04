import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

interface TenantContext {
  tenantId?: string;
}

export const tenantLocalStorage = new AsyncLocalStorage<TenantContext>();

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Authentication token not found");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, // Make sure JWT_SECRET is available as an env variable
      });

      if (!payload.tenantId) {
        throw new UnauthorizedException("Tenant ID not found in token payload");
      }

      request["user"] = payload; // Attach payload to request for later use
    } catch (e) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
