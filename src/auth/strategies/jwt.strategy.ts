import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    // Obter o segredo do ConfigService para garantir consistência
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error('JWT secret key is not defined');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
    
    // Verificar se o secretOrKey foi configurado corretamente
    console.log('JWT Strategy inicializada com sucesso');
    console.log('JWT Secret configurado:', !!secretKey);
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    try {
      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      // Garantir que as roles estejam disponíveis no objeto do usuário
      if (payload.roles) {
        user.roles = payload.roles;
      }
      
      // Garantir que o objeto user tenha todas as propriedades necessárias
      const userWithRoles = {
        ...user,
        id: user.id || payload.sub,
        email: user.email || payload.email,
        roles: user.roles || payload.roles || []
      };
      
      console.log('User authenticated:', userWithRoles);
      return userWithRoles;
    } catch (error) {
      console.error('Erro ao validar usuário:', error.message);
      throw new UnauthorizedException('Falha na autenticação do usuário');
    }
  }
}