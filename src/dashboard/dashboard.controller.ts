import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnergyDataDto } from './dto/energy-data.dto';
import { FinancialDataDto } from './dto/financial-data.dto';


@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna os dados para o dashboard' })
  @ApiResponse({ status: 200, description: 'Dados para o dashboard retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Faturas não encontradas' })
  @ApiQuery({ name: 'clienteId', required: false, description: 'ID do cliente para filtrar' })
  @ApiQuery({ name: 'dataInicio', required: false, description: 'Data inicial para filtrar (formato: MM/YYYY)' })
  @ApiQuery({ name: 'dataFim', required: false, description: 'Data final para filtrar (formato: MM/YYYY)' })
  getDashboardData(
    @Query('clienteId') clienteId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.dashboardService.getDashboardData(clienteId, dataInicio, dataFim);
  }

  @Get('energy')
  @ApiOperation({ summary: 'Retorna os dados de energia para o gráfico' })
  @ApiResponse({ status: 200, description: 'Dados de energia retornados com sucesso', type: EnergyDataDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Faturas não encontradas' })
  @ApiQuery({ name: 'clienteId', required: false, description: 'ID do cliente para filtrar' })
  @ApiQuery({ name: 'dataInicio', required: false, description: 'Data inicial para filtrar (formato: MM/YYYY)' })
  @ApiQuery({ name: 'dataFim', required: false, description: 'Data final para filtrar (formato: MM/YYYY)' })
  getEnergyData(
    @Query('clienteId') clienteId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ): Promise<EnergyDataDto> {
    return this.dashboardService.getEnergyData(clienteId, dataInicio, dataFim);
  }

  @Get('financial')
  @ApiOperation({ summary: 'Retorna os dados financeiros para o gráfico' })
  @ApiResponse({ status: 200, description: 'Dados financeiros retornados com sucesso', type: FinancialDataDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Faturas não encontradas' })
  @ApiQuery({ name: 'clienteId', required: false, description: 'ID do cliente para filtrar' })
  @ApiQuery({ name: 'dataInicio', required: false, description: 'Data inicial para filtrar (formato: MM/YYYY)' })
  @ApiQuery({ name: 'dataFim', required: false, description: 'Data final para filtrar (formato: MM/YYYY)' })
  getFinancialData(
    @Query('clienteId') clienteId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ): Promise<FinancialDataDto> {
    return this.dashboardService.getFinancialData(clienteId, dataInicio, dataFim);
  }

}
