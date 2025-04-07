import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class UploadFaturaDto {
  @ApiProperty({
    description: 'Arquivos PDF das faturas para upload',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsArray()
  files: Express.Multer.File[];
}
