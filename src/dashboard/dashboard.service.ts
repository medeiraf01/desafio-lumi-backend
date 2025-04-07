import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Fatura } from 'src/faturas/entities/fatura.entity';
import { Repository } from 'typeorm';
import { ConsumoFaturaDto } from './dto/consumo-fatura.dto';
import { EnergyDataDto } from './dto/energy-data.dto';
import { FinancialDataDto } from './dto/financial-data.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Fatura)
    private faturaRepository: Repository<Fatura>,
  ) {}
  /**
   * Converte o formato de mês de referência (ex: JAN/2024) para um formato comparável
   * @param mesReferencia String no formato 'MES/ANO' (ex: JAN/2024)
   * @returns String formatada para comparação
   */
  private formatarMesReferencia(mesReferencia: string): string {
    if (!mesReferencia) return '';

    // Mapeamento de abreviações de meses para números
    const mesesMap = {
      JAN: '01',
      FEV: '02',
      MAR: '03',
      ABR: '04',
      MAI: '05',
      JUN: '06',
      JUL: '07',
      AGO: '08',
      SET: '09',
      OUT: '10',
      NOV: '11',
      DEZ: '12',
    };

    // Extrair mês e ano do formato MES/ANO
    const partes = mesReferencia.split('/');
    if (partes.length !== 2) return mesReferencia; // Retorna o original se não estiver no formato esperado

    const mes = partes[0].toUpperCase();
    const ano = partes[1];

    // Converter mês para número se possível
    const mesNumero = mesesMap[mes] || mes;

    // Retornar no formato ANO-MES para comparação adequada
    return `${ano}-${mesNumero}`;
  }

  /**
   * Converte o formato de mês de referência para um formato de exibição abreviado
   * @param mesReferencia String no formato 'MES/ANO' (ex: JAN/2024)
   * @returns String formatada para exibição (ex: Jan)
   */
  private formatarMesParaExibicao(mesReferencia: string): string {
    if (!mesReferencia) return '';

    const partes = mesReferencia.split('/');
    if (partes.length !== 2) return mesReferencia;

    const mes = partes[0].toLowerCase();
    const ano = partes[1];

    // Retornar mês abreviado com ano para garantir ordenação correta
    return mes.charAt(0).toUpperCase() + mes.slice(1, 3) + '/' + ano;
  }

  /**
   * Agrupa faturas por mês e calcula os valores para o gráfico de energia
   */
  private processarDadosEnergia(faturas: Fatura[]): EnergyDataDto {
    // Agrupar faturas por mês
    const dadosPorMes = new Map<
      string,
      { consumo: number; compensada: number }
    >();

    faturas.forEach((fatura) => {
      const mesExibicao = this.formatarMesParaExibicao(fatura.mes_referencia);

      if (!dadosPorMes.has(mesExibicao)) {
        dadosPorMes.set(mesExibicao, { consumo: 0, compensada: 0 });
      }

      const dados = dadosPorMes.get(mesExibicao);
      if (dados) {
        dados.consumo +=
          Number(fatura.energia_eletrica_kwh) + Number(fatura.energia_scee_kwh);
        dados.compensada += Number(fatura.energia_compensada_kwh);
      }
    });

    // Converter para o formato esperado pelo DTO
    const result = new EnergyDataDto();
    result.data = Array.from(dadosPorMes.entries()).map(([month, values]) => ({
      month,
      consumo: Number(values.consumo.toFixed(2)),
      compensada: Number(values.compensada.toFixed(2)),
    }));

    // Ordenar por ano e mês
    result.data.sort((a, b) => {
      // Extrair ano e mês de cada item
      const [mesA, anoA] = a.month.split('/');
      const [mesB, anoB] = b.month.split('/');

      // Comparar anos primeiro
      if (anoA !== anoB) {
        return Number(anoA) - Number(anoB);
      }

      // Se os anos forem iguais, comparar meses
      const mesesOrdem = [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ];
      return mesesOrdem.indexOf(mesA) - mesesOrdem.indexOf(mesB);
    });

    return result;
  }

  /**
   * Agrupa faturas por mês e calcula os valores para o gráfico financeiro
   */
  private processarDadosFinanceiros(faturas: Fatura[]): FinancialDataDto {
    // Agrupar faturas por mês
    const dadosPorMes = new Map<string, { total: number; economia: number }>();

    faturas.forEach((fatura) => {
      const mesExibicao = this.formatarMesParaExibicao(fatura.mes_referencia);

      if (!dadosPorMes.has(mesExibicao)) {
        dadosPorMes.set(mesExibicao, { total: 0, economia: 0 });
      }

      const dados = dadosPorMes.get(mesExibicao);

      if (dados) {
        dados.total +=
          Number(fatura.energia_eletrica_valor) +
          Number(fatura.energia_scee_valor) +
          Number(fatura.contrib_ilum_pub_municipal);
        dados.economia += Number(fatura.energia_compensada_valor);
      }
    });

    // Converter para o formato esperado pelo DTO
    const result = new FinancialDataDto();
    result.data = Array.from(dadosPorMes.entries()).map(([month, values]) => ({
      month,
      total: Number(values.total.toFixed(2)),
      economia: Number(values.economia.toFixed(2)),
    }));

    // Ordenar por ano e mês
    result.data.sort((a, b) => {
      // Extrair ano e mês de cada item
      const [mesA, anoA] = a.month.split('/');
      const [mesB, anoB] = b.month.split('/');

      // Comparar anos primeiro
      if (anoA !== anoB) {
        return Number(anoA) - Number(anoB);
      }

      // Se os anos forem iguais, comparar meses
      const mesesOrdem = [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ];
      return mesesOrdem.indexOf(mesA) - mesesOrdem.indexOf(mesB);
    });

    return result;
  }

  /**
   * Filtra as faturas com base nos parâmetros fornecidos
   */
  private async filtrarFaturas(
    clienteId?: string,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<Fatura[]> {
    // Construir query com possíveis filtros
    let query = this.faturaRepository.createQueryBuilder('fatura');

    // Aplicar filtros se fornecidos
    if (clienteId) {
      query = query.where('fatura.cliente_id = :clienteId', { clienteId });
    }

    // Obter todas as faturas primeiro para filtrar por mês de referência depois
    let faturas = await query.getMany();

    // Filtrar por período se fornecido
    if (dataInicio || dataFim) {
      const dataInicioFormatada = dataInicio
        ? this.formatarMesReferencia(dataInicio)
        : '';
      const dataFimFormatada = dataFim
        ? this.formatarMesReferencia(dataFim)
        : '';

      faturas = faturas.filter((fatura) => {
        const mesReferenciaFormatado = this.formatarMesReferencia(
          fatura.mes_referencia,
        );

        if (dataInicioFormatada && dataFimFormatada) {
          return (
            mesReferenciaFormatado >= dataInicioFormatada &&
            mesReferenciaFormatado <= dataFimFormatada
          );
        } else if (dataInicioFormatada) {
          return mesReferenciaFormatado >= dataInicioFormatada;
        } else if (dataFimFormatada) {
          return mesReferenciaFormatado <= dataFimFormatada;
        }

        return true;
      });
    }

    // Verificar se há faturas após a filtragem
    if (!faturas || faturas.length === 0) {
      throw new NotFoundException('Faturas não encontradas');
    }

    return faturas;
  }

  async getDashboardData(
    clienteId?: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    // Utilizar o método filtrarFaturas para obter as faturas filtradas
    const faturas = await this.filtrarFaturas(clienteId, dataInicio, dataFim);

    // Inicializar o objeto de consumo com valores zerados
    const consumoFatura: ConsumoFaturaDto = {
      consumoTotal: 0,
      energiaCompensada: 0,
      valorTotalSemGD: 0,
      economiaGD: 0,
    };

    // Acumular valores de todas as faturas
    faturas.forEach((fatura) => {
      consumoFatura.consumoTotal +=
        Number(fatura.energia_eletrica_kwh) + Number(fatura.energia_scee_kwh);
      consumoFatura.energiaCompensada += Number(fatura.energia_compensada_kwh);
      consumoFatura.valorTotalSemGD +=
        Number(fatura.energia_eletrica_valor) +
        Number(fatura.energia_scee_valor) +
        Number(fatura.contrib_ilum_pub_municipal);
      consumoFatura.economiaGD += Number(fatura.energia_compensada_valor);
    });

    return consumoFatura;
  }

  /**
   * Retorna os dados de energia para o gráfico
   */
  async getEnergyData(
    clienteId?: string,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<EnergyDataDto> {
    const faturas = await this.filtrarFaturas(clienteId, dataInicio, dataFim);
    return this.processarDadosEnergia(faturas);
  }

  /**
   * Retorna os dados financeiros para o gráfico
   */
  async getFinancialData(
    clienteId?: string,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<FinancialDataDto> {
    const faturas = await this.filtrarFaturas(clienteId, dataInicio, dataFim);
    return this.processarDadosFinanceiros(faturas);
  }
}
