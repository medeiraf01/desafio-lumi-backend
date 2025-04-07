import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { UnauthorizedException } from '../../common/exceptions/unauthorized.exception';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`Endpoint is public: ${isPublic}`);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    this.logger.debug(`Authorization header: ${request.headers.authorization}`);
    
    this.logger.debug('Verificando autenticação JWT');
    
    // Garantir que o resultado seja sempre uma Promise<boolean>
    const result = super.canActivate(context);
    
    // Se o resultado for um Observable, converta para Promise
    if (result instanceof Observable) {
      return firstValueFrom(result);
    }
    
    // Se já for uma Promise ou boolean, retorne diretamente
    return result;
  }

  handleRequest(err, user, info, context) {
    // Melhorar logs para depuração
    if (info) {
      this.logger.debug(`JWT info: ${typeof info === 'object' ? JSON.stringify(info) : info}`);
    }
    
    // Tratamento de erro específico
    if (err) {
      this.logger.error(`JWT erro: ${err.message}`);
      throw new UnauthorizedException('Falha na autenticação', { error: err.message });
    }
    
    // Verificação de usuário
    if (!user) {
      this.logger.error('Usuário não encontrado após validação do token');
      throw new UnauthorizedException('Token inválido ou ausente');
    }
    
    try {
      // Anexar usuário ao request
      const request = context.switchToHttp().getRequest();
      request.user = user;
      
      this.logger.debug(`Usuário autenticado: ${user.email}`);
      if (user.roles) {
        this.logger.debug(`Roles do usuário: ${JSON.stringify(user.roles)}`);
      }
    } catch (error) {
      this.logger.error(`Erro ao processar autenticação: ${error.message}`);
      throw new UnauthorizedException('Erro no processamento da autenticação');
    }
    
    return user;
  }
}