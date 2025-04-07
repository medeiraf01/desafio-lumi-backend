import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindFaturasFilterDto {
  @ApiProperty({
    description: 'Número do cliente para filtrar faturas',
    example: '12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  numero_cliente?: string;

  @ApiProperty({
    description: 'Data inicial para filtrar faturas (formato: YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  mes_inicio?: Date;

  @ApiProperty({
    description: 'Data final para filtrar faturas (formato: YYYY-MM-DD)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  mes_fim?: Date;
}