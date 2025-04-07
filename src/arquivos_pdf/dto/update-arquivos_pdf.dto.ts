import { PartialType } from '@nestjs/swagger';
import { CreateArquivosPdfDto } from './create-arquivos_pdf.dto';

export class UpdateArquivosPdfDto extends PartialType(CreateArquivosPdfDto) {}
