import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CustomerModule } from './customer/customer.module';

import { ArquivosPdfModule } from './arquivos_pdf/arquivos_pdf.module';

import { FaturasModule } from './faturas/faturas.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserModule,
    CustomerModule,
    DashboardModule,
    ConfigModule,
    HealthModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database') as TypeOrmModuleOptions,
    }),
    CustomerModule,

    ArquivosPdfModule,
    FaturasModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
