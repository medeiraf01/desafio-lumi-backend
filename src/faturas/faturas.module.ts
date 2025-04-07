import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaturasService } from './faturas.service';
import { FaturasController } from './faturas.controller';
import { Fatura } from './entities/fatura.entity';
import { MulterModule } from '@nestjs/platform-express';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fatura]),
    CustomerModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [FaturasController],
  providers: [FaturasService],
})
export class FaturasModule {}
