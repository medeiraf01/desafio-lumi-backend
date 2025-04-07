import { Test, TestingModule } from '@nestjs/testing';
import { ArquivosPdfController } from './arquivos_pdf.controller';
import { ArquivosPdfService } from './arquivos_pdf.service';

describe('ArquivosPdfController', () => {
  let controller: ArquivosPdfController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArquivosPdfController],
      providers: [ArquivosPdfService],
    }).compile();

    controller = module.get<ArquivosPdfController>(ArquivosPdfController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
