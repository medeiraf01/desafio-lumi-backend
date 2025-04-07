import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/entities/user.entity';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    // Log para depuração
    this.logger.debug(`Verificando roles para usuário: ${JSON.stringify(user)}`);
    this.logger.debug(`Token de autenticação: ${request.headers.authorization}`);
    
    // Verificar se o usuário existe antes de verificar as roles
    if (!user) {
      this.logger.warn('Usuário não encontrado no request');
      // Em vez de lançar uma exceção, retornar false para permitir que o JwtAuthGuard seja executado primeiro
      return false;
    }
    
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
    this.logger.debug(`Usuário tem as roles necessárias: ${hasRole}`);
    return hasRole;
  }
}