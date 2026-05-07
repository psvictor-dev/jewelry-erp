import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  product: { findUniqueOrThrow: jest.fn(), update: jest.fn() },
  sale: { create: jest.fn(), findMany: jest.fn(), findUniqueOrThrow: jest.fn() },
  stockMovement: { create: jest.fn() },
  $transaction: jest.fn(),
};

const makeProduct = (overrides = {}) => ({
  id: 'prod-1', name: 'Anel Ouro 18k', sku: 'AN-001',
  stock: 10, salePrice: 500, costPrice: 200,
  ...overrides,
});

const makeSaleDto = (overrides = {}) => ({
  items: [{ productId: 'prod-1', quantity: 2 }],
  paymentMethod: 'PIX',
  discount: 0,
  installments: 1,
  ...overrides,
});

describe('SalesService', () => {
  let service: SalesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(SalesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria venda, debita estoque e registra movimentação', async () => {
      const product = makeProduct();
      mockPrisma.product.findUniqueOrThrow.mockResolvedValue(product);

      const sale = { id: 'sale-1', total: 1000, items: [] };
      mockPrisma.$transaction.mockResolvedValue([sale]);

      const result = await service.create(makeSaleDto(), 'user-1');

      expect(result).toBe(sale);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('calcula total corretamente (preço × qtd − desconto global)', async () => {
      mockPrisma.product.findUniqueOrThrow.mockResolvedValue(makeProduct({ salePrice: 300 }));
      mockPrisma.$transaction.mockResolvedValue([{ id: 'sale-2' }]);

      await service.create(makeSaleDto({ items: [{ productId: 'prod-1', quantity: 3 }], discount: 50 }), 'user-1');

      expect(mockPrisma.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ total: 850 }) }),
      );
    });

    it('usa unitPrice customizado quando informado no item', async () => {
      mockPrisma.product.findUniqueOrThrow.mockResolvedValue(makeProduct({ salePrice: 500 }));
      mockPrisma.$transaction.mockResolvedValue([{ id: 'sale-3' }]);

      await service.create(
        makeSaleDto({ items: [{ productId: 'prod-1', quantity: 1, unitPrice: 400 }] }),
        'user-1',
      );

      expect(mockPrisma.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ total: 400 }) }),
      );
    });

    it('lança BadRequestException quando estoque insuficiente', async () => {
      mockPrisma.product.findUniqueOrThrow.mockResolvedValue(makeProduct({ stock: 1 }));

      await expect(
        service.create(makeSaleDto({ items: [{ productId: 'prod-1', quantity: 5 }] }), 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('retorna lista sem filtros', async () => {
      const sales = [{ id: 'sale-1' }];
      mockPrisma.$transaction.mockResolvedValue([sales, 1]);

      const result = await service.findAll();

      expect(result.data).toBe(sales);
    });

    it('filtra por status quando informado', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll({ status: 'RECEBIDO' });

      expect(mockPrisma.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'RECEBIDO' }) }),
      );
    });
  });

  describe('findOne', () => {
    it('retorna venda pelo id', async () => {
      const sale = { id: 'sale-1', items: [] };
      mockPrisma.sale.findUniqueOrThrow.mockResolvedValue(sale);

      const result = await service.findOne('sale-1');

      expect(result).toBe(sale);
      expect(mockPrisma.sale.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'sale-1' } }),
      );
    });
  });
});
