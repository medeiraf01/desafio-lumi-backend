import { Module } from '@nestjs/common';
import { ArquivosPdfService } from './arquivos_pdf.service';
import { ArquivosPdfController } from './arquivos_pdf.controller';

@Module({
  controllers: [ArquivosPdfController],
  providers: [ArquivosPdfService],
})
export class ArquivosPdfModule {}
