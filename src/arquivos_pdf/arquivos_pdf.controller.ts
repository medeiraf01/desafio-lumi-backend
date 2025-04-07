import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ArquivosPdfService } from './arquivos_pdf.service';
import { CreateArquivosPdfDto } from './dto/create-arquivos_pdf.dto';
import { UpdateArquivosPdfDto } from './dto/update-arquivos_pdf.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('arquivos-pdf')
@Controller('arquivos-pdf')
export class ArquivosPdfController {
  constructor(private readonly arquivosPdfService: ArquivosPdfService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um novo arquivo PDF' })
  @ApiResponse({ status: 201, description: 'Arquivo PDF criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createArquivosPdfDto: CreateArquivosPdfDto) {
    return this.arquivosPdfService.create(createArquivosPdfDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os arquivos PDF' })
  @ApiResponse({ status: 200, description: 'Lista de arquivos PDF retornada com sucesso' })
  findAll() {
    return this.arquivosPdfService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar um arquivo PDF pelo ID' })
  @ApiResponse({ status: 200, description: 'Arquivo PDF encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Arquivo PDF não encontrado' })
  findOne(@Param('id') id: string) {
    return this.arquivosPdfService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar um arquivo PDF' })
  @ApiResponse({ status: 200, description: 'Arquivo PDF atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Arquivo PDF não encontrado' })
  update(@Param('id') id: string, @Body() updateArquivosPdfDto: UpdateArquivosPdfDto) {
    return this.arquivosPdfService.update(+id, updateArquivosPdfDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover um arquivo PDF' })
  @ApiResponse({ status: 200, description: 'Arquivo PDF removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Arquivo PDF não encontrado' })
  remove(@Param('id') id: string) {
    return this.arquivosPdfService.remove(+id);
  }
}
