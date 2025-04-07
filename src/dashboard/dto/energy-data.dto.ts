import { ApiProperty } from '@nestjs/swagger';

class MonthlyEnergyData {
  @ApiProperty({
    description: 'Mês de referência',
    example: 'Jan',
  })
  month: string;

  @ApiProperty({
    description: 'Consumo de energia em kWh',
    example: 4000,
  })
  consumo: number;

  @ApiProperty({
    description: 'Energia compensada em kWh',
    example: 2400,
  })
  compensada: number;
}

export class EnergyDataDto {
  @ApiProperty({
    description: 'Dados de energia mensal',
    type: [MonthlyEnergyData],
    example: [
      { month: 'Jan', consumo: 4000, compensada: 2400 },
      { month: 'Fev', consumo: 3000, compensada: 1398 },
      { month: 'Mar', consumo: 2000, compensada: 9800 },
    ],
  })
  data: MonthlyEnergyData[];
}