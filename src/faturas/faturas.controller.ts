import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { FaturasService } from './faturas.service';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';
import { FindFaturasFilterDto } from './dto/find-faturas-filter.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as multer from 'multer';

@ApiTags('faturas')
@ApiBearerAuth()
@Controller('faturas')
export class FaturasController {
  constructor(private readonly faturasService: FaturasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova fatura' })
  @ApiResponse({ status: 201, description: 'Fatura criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@Body() createFaturaDto: CreateFaturaDto) {
    return this.faturasService.create(createFaturaDto);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Apenas arquivos PDF são permitidos'), false);
        }
        cb(null, true);
      },
    }),
  )
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Fazer upload de arquivos PDF de faturas' })
  @ApiResponse({ status: 201, description: 'Arquivos processados com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao processar arquivos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadPdf(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // Aqui você pode processar os buffers dos arquivos PDF
    for (const file of files) {
      console.log(`Arquivo recebido: ${file.originalname}, ${file.size} bytes`);
      // Ex: usar pdf-parse aqui
    }

    // Aguarda o processamento dos arquivos PDF
    const resultado = await this.faturasService.processarArquivosPdf(files);

    return resultado;
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as faturas com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de faturas retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(@Query() filterDto: FindFaturasFilterDto) {
    return this.faturasService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma fatura pelo ID' })
  @ApiResponse({ status: 200, description: 'Fatura encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findOne(@Param('id') id: string) {
    return this.faturasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma fatura' })
  @ApiResponse({ status: 200, description: 'Fatura atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  update(@Param('id') id: string, @Body() updateFaturaDto: UpdateFaturaDto) {
    return this.faturasService.update(id, updateFaturaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma fatura' })
  @ApiResponse({ status: 200, description: 'Fatura removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  remove(@Param('id') id: string) {
    return this.faturasService.remove(id);
  }

  @Get('download/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fazer download do PDF de uma fatura' })
  @ApiResponse({ status: 200, description: 'Download do PDF realizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Fatura ou arquivo PDF não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async downloadFatura(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { path, filename } = await this.faturasService.downloadFatura(id);
    
    const file = createReadStream(path);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    
    return new StreamableFile(file);
  }
}
