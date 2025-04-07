import { Test, TestingModule } from '@nestjs/testing';
import { FaturasController } from './faturas.controller';
import { FaturasService } from './faturas.service';

describe('FaturasController', () => {
  let controller: FaturasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaturasController],
      providers: [FaturasService],
    }).compile();

    controller = module.get<FaturasController>(FaturasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
