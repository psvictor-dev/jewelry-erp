import { Test } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    fields: { minStock: 'minStock' },
  },
  $transaction: jest.fn(),
};

const makeProduct = (overrides = {}) => ({
  id: 'prod-1', sku: 'AN-001', name: 'Anel Ouro', status: 'ATIVO',
  stock: 5, minStock: 1, costPrice: 200, salePrice: 500, category: null,
  ...overrides,
});

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(ProductsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockResolvedValue([[makeProduct()], 1]);
    });

    it('retorna dados paginados com page e totalPages', async () => {
      const result = await service.findAll();

      expect(result).toMatchObject({ data: [expect.any(Object)], total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('aplica paginação correta: skip = (page-1) * limit', async () => {
      await service.findAll({ page: 3, limit: 10 });

      const [findManyCall] = mockPrisma.$transaction.mock.calls[0][0];
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('filtra por status', async () => {
      await service.findAll({ status: 'ATIVO' as any });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'ATIVO' }) }),
      );
    });

    it('filtra por categoria', async () => {
      await service.findAll({ categoryId: 'cat-1' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ categoryId: 'cat-1' }) }),
      );
    });

    it('busca por nome e SKU (OR) quando search informado', async () => {
      await service.findAll({ search: 'ouro' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'ouro', mode: 'insensitive' } },
              { sku:  { contains: 'ouro', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('calcula totalPages corretamente para 25 itens com limit 10', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 25]);

      const result = await service.findAll({ limit: 10 });

      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('retorna produto pelo id', async () => {
      const product = makeProduct();
      mockPrisma.product.findUniqueOrThrow.mockResolvedValue(product);

      const result = await service.findOne('prod-1');

      expect(result).toBe(product);
      expect(mockPrisma.product.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'prod-1' } }),
      );
    });
  });

  describe('create', () => {
    it('cria produto e ignora campos de relação', async () => {
      const created = makeProduct();
      mockPrisma.product.create.mockResolvedValue(created);

      const input = {
        sku: 'AN-001', name: 'Anel Ouro',
        id: 'ignorar', category: { id: 'cat-1' }, stockMovements: [], quoteItems: [], saleItems: [],
        createdAt: new Date(), updatedAt: new Date(),
      };

      await service.create(input);

      const savedData = mockPrisma.product.create.mock.calls[0][0].data;
      expect(savedData).not.toHaveProperty('id');
      expect(savedData).not.toHaveProperty('category');
      expect(savedData).not.toHaveProperty('stockMovements');
      expect(savedData).toHaveProperty('sku', 'AN-001');
    });
  });

  describe('update', () => {
    it('atualiza produto pelo id e ignora campos de relação', async () => {
      mockPrisma.product.update.mockResolvedValue(makeProduct({ name: 'Anel Prata' }));

      const input = { name: 'Anel Prata', category: { id: 'cat-1' }, stockMovements: [] };
      await service.update('prod-1', input);

      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: expect.not.objectContaining({ category: expect.anything() }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('desativa produto (soft delete → status INATIVO)', async () => {
      mockPrisma.product.update.mockResolvedValue(makeProduct({ status: 'INATIVO' }));

      await service.remove('prod-1');

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { status: 'INATIVO' },
      });
    });
  });
});
