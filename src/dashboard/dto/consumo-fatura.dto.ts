import { ApiProperty } from '@nestjs/swagger';


export class ConsumoFaturaDto  {
  
  

    @ApiProperty({
        description: 'Consumo total',
        example: 1000,
        required: false,
      })
    consumoTotal: number;

    @ApiProperty({
        description: 'Energia compensada',
        example: 1000,
        required: false,
      })
    energiaCompensada: number;
    
    @ApiProperty({
        description: 'Valor total sem GD',
        example: 1000,
        required: false,
      })
    valorTotalSemGD: number;

    @ApiProperty({
        description: 'Economia GD',
        example: 1000,
        required: false,
      })
    economiaGD: number;

    
}