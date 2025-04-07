import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // Obter o segredo do ConfigService para garantir consistência
        const secret = configService.get<string>('jwt.secret');
        if (!secret) {
          console.error('JWT_SECRET não está definido na configuração');
        }
        console.log('Auth Module - JWT Secret configurado:', !!secret);
        return {
          secret: secret,
          signOptions: {
            expiresIn: configService.get<string>('jwt.expiresIn') || '1h',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    // Registrando apenas o JwtAuthGuard como guard global
    // Isso garantirá que a autenticação seja verificada antes de qualquer verificação de roles
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
    // Removendo o RolesGuard global para evitar problemas de ordem de execução
    // Em vez disso, vamos aplicar o RolesGuard explicitamente nos controllers quando necessário
  ],
  exports: [AuthService],
})
export class AuthModule {}
