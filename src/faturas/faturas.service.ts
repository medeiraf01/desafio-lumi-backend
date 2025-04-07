import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';
import { FindFaturasFilterDto } from './dto/find-faturas-filter.dto';
import { Fatura } from './entities/fatura.entity';
import { Customer } from '../customer/entities/customer.entity';
import * as pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

@Injectable()
export class FaturasService {
  constructor(
    @InjectRepository(Fatura)
    private faturaRepository: Repository<Fatura>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createFaturaDto: CreateFaturaDto) {
    // Verifica se a fatura já existe pelo número de instalação e mês de referência
    const faturaExists = await this.faturaRepository.findOne({
      where: {
        numero_instalacao: createFaturaDto.numero_instalacao,
        mes_referencia: createFaturaDto.mes_referencia,
      },
    });

    if (faturaExists) {
      return {
        message: 'Fatura já existe',
        data: faturaExists,
      };
    }

    // Verifica se o cliente existe pelo número do cliente
    let clienteExiste = await this.customerRepository.findOne({
      where: { num_cliente: createFaturaDto.cliente_id },
    });

    // Se o cliente não existir, cria um novo
    if (!clienteExiste) {
      clienteExiste = await this.customerRepository.save({
        num_cliente: createFaturaDto.cliente_id,
      });
    }

    // Atualiza o cliente_id no DTO para o ID do cliente no banco de dados
    createFaturaDto.cliente_id = clienteExiste.id;

    // Cria e salva a fatura
    const fatura = this.faturaRepository.create(createFaturaDto);
    await this.faturaRepository.save(fatura);

    return {
      message: 'Fatura criada com sucesso',
      data: fatura,
    };
  }

  async processarArquivosPdf(files: Express.Multer.File[]) {
    const resultados: { message: string; data: any }[] = [];
    const writeFileAsync = promisify(fs.writeFile);
    const uploadsDir = path.join(process.cwd(), 'uploads', 'faturas');

    // Garantir que o diretório de uploads existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (const file of files) {
      const data = await pdfParse(file.buffer);
      const texto = data.text;

      const energia_eletrica = this.extractEnergyData(
        texto,
        'Energia Elétrica',
      );
      const energia_scee = this.extractEnergyDataOther(
        texto,
        'Energia SCEE s/ ICMS',
      );
      const energia_compensada = this.extractEnergyDataOther(
        texto,
        'Energia compensada GD I',
      );

      // Extrair dados da fatura
      const clienteId = this.extrairClienteId(texto).split(' ')?.[0];
      const mesReferencia =
        this.extractValueBelowLabel(texto, 'Referente a')
          ?.split(/\s+/)
          .slice(0, 1)
          .join(' ') ?? '';
      const numeroInstalacao =
        this.extractValueBelowLabel(texto, 'Nº DA INSTALAÇÃO')
          ?.split(/\s+/)
          .slice(1, 2)
          .join(' ') ?? '';

      // Criar um nome de arquivo único baseado nos dados da fatura
      const fileName = `${clienteId}_${numeroInstalacao}_${mesReferencia.replace('/', '_')}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      // Salvar o arquivo PDF no sistema de arquivos
      await writeFileAsync(filePath, file.buffer);

      const faturaExtraida: CreateFaturaDto = {
        // Extrair Cliente ID
        cliente_id: clienteId,

        numero_instalacao: numeroInstalacao,
        mes_referencia: mesReferencia,

        // Extrair Data de Vencimento
        data_vencimento:
          this.extractValueBelowLabel(texto, 'Referente a')
            ?.split(/\s+/)
            .slice(1, 2)
            .join(' ') ?? '',

        // Extrair Valor Total a Pagar
        total_a_pagar: this.toFloat(
          this.extractValueBelowLabel(texto, 'Referente a')
            ?.split(/\s+/)
            .slice(2, 3)
            .join(' '),
        ),

        energia_eletrica_kwh: Number(energia_eletrica?.quantity || 0),
        energia_eletrica_valor: this.toFloat(
          energia_eletrica?.totalValue || '0',
        ),

        // Extrair Energia SCEE (kWh e Valor)
        energia_scee_kwh: this.toFloat(energia_scee?.quantity || '0'),
        energia_scee_valor: this.toFloat(energia_scee?.totalValue || '0'),

        // Extrair Energia Compensada GD I (kWh e Valor)
        energia_compensada_kwh: this.toFloat(
          energia_compensada?.quantity || '0',
        ),
        energia_compensada_valor: this.toFloat(
          energia_compensada?.totalValue || '0',
        ),

        // Extrair Contribuição de Iluminação Pública
        contrib_ilum_pub_municipal:
          this.toFloat(
            this.extract(texto, /Contrib Ilum Publica Municipal\s+(\d+,\d{2})/),
          ) ?? 0,

        // Extrair Histórico de Consumo
        //historico_consumo: this.extrairHistoricoConsumo(texto),

        consumo_energia_eletrica_kwh:
          this.toFloat(energia_eletrica?.quantity || '0') +
          parseFloat(energia_scee?.quantity || '0'),

        valor_total_sem_gd: this.toFloat(
          (energia_eletrica?.totalValue || '0') +
            parseFloat(energia_scee?.totalValue || '0') +
            parseFloat(
              this.extract(
                texto,
                /Contrib Ilum Publica Municipal\s+(\d+,\d{2})/,
              ),
            ),
        ),
      };

      // Salvar a fatura no banco de dados com o caminho do PDF
      const fatura = await this.create(faturaExtraida);

      // Atualizar o caminho do PDF na fatura
      if ('data' in fatura && fatura.data instanceof Fatura && fatura.data.id) {
        await this.faturaRepository.update(fatura.data.id, {
          pdf_path: filePath,
        });
      }

      // Adiciona o resultado ao array de resultados
      const result = {
        message: 'Fatura processada com sucesso',
        data: faturaExtraida,
      };
      resultados.push(result);
    }

    return {
      message: 'Faturas processadas com sucesso',
      faturas: resultados,
    };
  }

  private extractEnergyData(
    text: string,
    includes: string,
  ): {
    unit: string;
    quantity: string;
    unitPrice: string;
    totalValue: string;
    additionalValue: string;
  } | null {
    // Dividir o texto em linhas
    const lines = text.split('\n');

    // Procurar a linha que contém o rótulo desejado (ex.: "Energia Elétrica")
    const energyLine = lines.find((line) => line.includes(includes));
    if (!energyLine) return null;

    console.log('Energy Line:', energyLine);

    // Dividir a linha em partes usando espaços como delimitador
    const parts = energyLine.split(/\s+/).filter((part) => part.trim() !== '');

    // Verificar se há partes suficientes para extrair os dados
    if (parts.length < 6) {
      console.error('Erro: A linha não contém dados suficientes.');
      return null;
    }

    // Extrair os valores
    const unit = parts[1]; // Unidade (ex.: kWh)
    const quantity = parts[2].replace('.', ''); // Quantidade (ex.: 2.500 → 2500)
    const unitPrice = parts[3].replace(',', '.'); // Preço Unitário (ex.: 0,95863974 → 0.95863974)
    const totalValue = parts[4].replace(',', '.'); // Valor Total (ex.: 95,85 → 95.85)
    const additionalValue = parts[5].replace(',', '.'); // Outro Valor (ex.: 0,74906000 → 0.74906)

    // Retornar os valores em um objeto
    return {
      unit,
      quantity,
      unitPrice,
      totalValue,
      additionalValue,
    };
  }

  private extractEnergyDataOther(
    text: string,
    includes: string,
  ): {
    unit: string;
    quantity: string;
    unitPrice: string;
    totalValue: string;
    additionalValue: string;
  } | null {
    // Dividir o texto em linhas
    const lines = text.split('\n');

    // Procurar a linha que contém o rótulo desejado (ex.: "Energia Elétrica")
    const energyLine = lines.find((line) => line.includes(includes));
    if (!energyLine) return null;

    console.log('Energy Line:', energyLine);

    // Dividir a linha em partes usando espaços como delimitador
    const parts = energyLine.split(/\s+/).filter((part) => part.trim() !== '');

    // Verificar se há partes suficientes para extrair os dados
    if (parts.length < 6) {
      console.error('Erro: A linha não contém dados suficientes.');
      return null;
    }

    // Extrair os valores
    const unit = parts[3]; // Unidade (ex.: kWh)
    const quantity = parts[4].replace('.', ''); // Quantidade (ex.: 2.500 → 2500)
    const unitPrice = parts[5].replace(',', '.'); // Preço Unitário (ex.: 0,95863974 → 0.95863974)
    const totalValue = parts[6].replace(',', '.'); // Valor Total (ex.: 95,85 → 95.85)
    const additionalValue = parts[7].replace(',', '.'); // Outro Valor (ex.: 0,74906000 → 0.74906)

    // Retornar os valores em um objeto
    return {
      unit,
      quantity,
      unitPrice,
      totalValue,
      additionalValue,
    };
  }

  private extractValueBelowLabel(text: string, label: string): string | null {
    // Divide o texto em linhas
    const lines = text.split('\n');

    // Encontra o índice da linha que contém o rótulo
    const labelIndex = lines.findIndex((line) => line.includes(label));
    if (labelIndex === -1) return null; // Rótulo não encontrado

    // Verifica a próxima linha após o rótulo
    const nextLine = lines[labelIndex + 1];
    if (!nextLine) return null; // Não há próxima linha

    // Remove espaços extras e retorna o valor
    return nextLine.trim();
  }

  async findAll(filterDto: FindFaturasFilterDto) {
    const { numero_cliente, mes_inicio, mes_fim } = filterDto;

    // Construir a query base
    const queryBuilder = this.faturaRepository
      .createQueryBuilder('fatura')
      .leftJoinAndSelect('fatura.cliente', 'cliente');

    // Aplicar filtro por número do cliente
    if (numero_cliente) {
      queryBuilder.andWhere('cliente.num_cliente = :numero_cliente', {
        numero_cliente,
      });
    }

    // Aplicar filtro por período (data inicial)
    if (mes_inicio) {
      // Converter a data para string no formato YYYY-MM
      const mesInicioStr = mes_inicio.toISOString().substring(0, 7);
      // Usar LIKE para comparar o início do mes_referencia
      queryBuilder.andWhere('fatura.mes_referencia >= :mes_inicio', {
        mes_inicio: mesInicioStr,
      });
    }

    // Aplicar filtro por período (data final)
    if (mes_fim) {
      // Converter a data para string no formato YYYY-MM
      const mesFimStr = mes_fim.toISOString().substring(0, 7);
      // Usar LIKE para comparar o início do mes_referencia
      queryBuilder.andWhere('fatura.mes_referencia <= :mes_fim', {
        mes_fim: mesFimStr,
      });
    }

    // Ordenar por data de referência (mais recente primeiro)
    queryBuilder.orderBy('fatura.mes_referencia', 'DESC');

    // Executar a consulta
    const faturas = await queryBuilder.getMany();

    return {
      message: 'Faturas encontradas com sucesso',
      count: faturas.length,
      data: faturas,
    };
  }

  findOne(id: string) {
    return `Buscando fatura com id ${id}`;
  }

  update(id: string, updateFaturaDto: UpdateFaturaDto) {
    return `Atualizando fatura ${id}`;
  }

  remove(id: string) {
    return `Removendo fatura ${id}`;
  }

  /**
   * Retorna o arquivo PDF da fatura para download
   * @param id ID da fatura
   * @returns Stream do arquivo PDF
   */
  async downloadFatura(id: string) {
    const fatura = await this.faturaRepository.findOne({ where: { id } });

    if (!fatura) {
      throw new NotFoundException('Fatura não encontrada');
    }

    if (!fatura.pdf_path || !fs.existsSync(fatura.pdf_path)) {
      throw new NotFoundException('Arquivo PDF da fatura não encontrado');
    }

    return {
      path: fatura.pdf_path,
      filename: path.basename(fatura.pdf_path),
    };
  }

  // Função para extrair o ID do cliente
  private extrairClienteId(text: string): string {
    const regexInline = /Nº DO CLIENTE\s*(\d+)/;
    const matchInline = text.match(regexInline);
    if (matchInline) return matchInline[1];

    // Se não estiver na mesma linha, procure na próxima linha
    const lines = text.split('\n');
    const clienteIndex = lines.findIndex((line) =>
      line.includes('Nº DO CLIENTE'),
    );
    if (clienteIndex !== -1 && lines[clienteIndex + 1]) {
      return lines[clienteIndex + 1].trim();
    }

    return '';
  }

  // Função para extrair valores usando regex
  private extract(text: string, regex: RegExp): string {
    const match = text.match(regex);
    return match?.[1] || '';
  }

  // Função para converter valores monetários ou numéricos para float
  private toFloat(valor: string): number {
    const cleaned = (valor || '0').replace('.', '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Função para converter datas no formato "MAR/2024" para objeto Date
  private toDate(mesAno: string): Date | null {
    if (!mesAno) return null;
    const [mes, ano] = mesAno.split('/');
    const meses: Record<string, number> = {
      JAN: 0,
      FEV: 1,
      MAR: 2,
      ABR: 3,
      MAI: 4,
      JUN: 5,
      JUL: 6,
      AGO: 7,
      SET: 8,
      OUT: 9,
      NOV: 10,
      DEZ: 11,
    };
    const data = new Date(parseInt(ano), meses[mes.toUpperCase()] ?? 0, 1);
    return isNaN(data.getTime()) ? null : data;
  }

  // Função para extrair histórico de consumo
  private extrairHistoricoConsumo(
    text: string,
  ): { mesAno: string; consumo: number; media: number; dias: number }[] {
    const regex =
      /Histórico de Consumo\s*MÊS\/ANO\s*Cons\. kWh\s*Média kWh\/Dia\s*Dias([\s\S]*?)Reservado ao Fisco/;
    const match = text.match(regex);
    if (!match) return [];
    return [];
  }
}
