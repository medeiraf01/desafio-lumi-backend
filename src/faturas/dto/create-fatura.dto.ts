import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFaturaDto {

  
  
  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  cliente_id: string;
  @ApiProperty({
    description: 'Numero de instalção',
    example: "werwe0-00rwe",
  })
  @IsNotEmpty()
 numero_instalacao: string;

  @ApiProperty({
    description: 'Mês de referência da fatura',
    example: '2024-04-01',
  })
  @IsNotEmpty()
 
  @Type(() => String)
  mes_referencia: string;

  @IsNotEmpty()
  
  @Type(() => String)
  data_vencimento: string;

  @ApiProperty({
    description: 'Quantidade de energia consumida (kWh)',
    example: 150.5,
  })
  @IsNotEmpty()
  @IsNumber()
  energia_eletrica_kwh: number;

  @ApiProperty({
    description: 'Valor da energia elétrica (R$)',
    example: 120.75,
  })
  @IsNotEmpty()
  @IsNumber()
  energia_eletrica_valor: number;

  @ApiProperty({
    description: 'Quantidade de energia SCEE (kWh)',
    example: 50.25,
  })
  @IsNotEmpty()
  @IsNumber()
  energia_scee_kwh: number;

  @ApiProperty({
    description: 'Valor da energia SCEE (R$)',
    example: 40.5,
  })
  @IsNotEmpty()
  @IsNumber()
  energia_scee_valor: number;

  @ApiProperty({
    description: 'Energia compensada GD I (kWh)',
    example: 30.75,
  })
  @IsNotEmpty()
  @IsNumber()
  energia_compensada_kwh: number;

  @ApiProperty({
    description: 'Valor da energia compensada GD I (R$)',
    example: 25.5,
  })
  @IsNotEmpty()
  @IsNumber()
  energia_compensada_valor: number;

  @ApiProperty({
    description: 'Valor da contribuição de iluminação pública (R$)',
    example: 15.25,
  })
  @IsNotEmpty()
  @IsNumber()
  contrib_ilum_pub_municipal: number;

  @IsNotEmpty()
  @IsNumber()
  total_a_pagar: number;


  @IsNotEmpty()
  @IsNumber()
  consumo_energia_eletrica_kwh: number;


  @IsNotEmpty()
  @IsNumber()
  valor_total_sem_gd: number;
  
  
}