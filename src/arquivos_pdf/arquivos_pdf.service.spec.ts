import { Test, TestingModule } from '@nestjs/testing';
import { ArquivosPdfService } from './arquivos_pdf.service';

describe('ArquivosPdfService', () => {
  let service: ArquivosPdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArquivosPdfService],
    }).compile();

    service = module.get<ArquivosPdfService>(ArquivosPdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
