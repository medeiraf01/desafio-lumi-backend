import { Injectable } from '@nestjs/common';
import { CreateArquivosPdfDto } from './dto/create-arquivos_pdf.dto';
import { UpdateArquivosPdfDto } from './dto/update-arquivos_pdf.dto';

@Injectable()
export class ArquivosPdfService {
  create(createArquivosPdfDto: CreateArquivosPdfDto) {
    return 'This action adds a new arquivosPdf';
  }

  findAll() {
    return `This action returns all arquivosPdf`;
  }

  findOne(id: number) {
    return `This action returns a #${id} arquivosPdf`;
  }

  update(id: number, updateArquivosPdfDto: UpdateArquivosPdfDto) {
    return `This action updates a #${id} arquivosPdf`;
  }

  remove(id: number) {
    return `This action removes a #${id} arquivosPdf`;
  }
}
