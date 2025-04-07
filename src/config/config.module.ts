import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { join } from 'path';
import databaseConfig from './database.config';
import cacheConfig from './cache.config';
import jwtConfig from './jwt.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
      expandVariables: true,
      load: [databaseConfig, cacheConfig, jwtConfig],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
