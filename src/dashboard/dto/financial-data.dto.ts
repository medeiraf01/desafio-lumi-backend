import { ApiProperty } from '@nestjs/swagger';

class MonthlyFinancialData {
  @ApiProperty({
    description: 'Mês de referência',
    example: 'Jan',
  })
  month: string;

  @ApiProperty({
    description: 'Valor total da fatura em R$',
    example: 2400,
  })
  total: number;

  @ApiProperty({
    description: 'Economia gerada em R$',
    example: 1200,
  })
  economia: number;
}

export class FinancialDataDto {
  @ApiProperty({
    description: 'Dados financeiros mensais',
    type: [MonthlyFinancialData],
    example: [
      { month: 'Jan', total: 2400, economia: 1200 },
      { month: 'Fev', total: 1398, economia: 800 },
      { month: 'Mar', total: 9800, economia: 4000 },
    ],
  })
  data: MonthlyFinancialData[];
}