import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: { search?: string; categoryId?: string; status?: ProductStatus; page?: number; limit?: number }) {
    const page  = Number(params?.page  ?? 1);
    const limit = Number(params?.limit ?? 20);
    const skip  = (page - 1) * limit;

    const where: any = {};
    if (params?.status)     where.status     = params.status;
    if (params?.categoryId) where.categoryId = params.categoryId;
    if (params?.search)     where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { sku:  { contains: params.search, mode: 'insensitive' } },
    ];

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, skip, take: limit, include: { category: true }, orderBy: { name: 'asc' } }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string) {
    return this.prisma.product.findUniqueOrThrow({ where: { id }, include: { category: true, stockMovements: { take: 10, orderBy: { createdAt: 'desc' } } } });
  }

  create(data: any) {
    const { id: _id, category: _cat, stockMovements: _sm, quoteItems: _qi, saleItems: _si, createdAt: _ca, updatedAt: _ua, ...rest } = data;
    return this.prisma.product.create({ data: rest, include: { category: true } });
  }

  update(id: string, data: any) {
    const { id: _id, category: _cat, stockMovements: _sm, quoteItems: _qi, saleItems: _si, createdAt: _ca, updatedAt: _ua, ...rest } = data;
    return this.prisma.product.update({ where: { id }, data: rest, include: { category: true } });
  }

  remove(id: string) { return this.prisma.product.update({ where: { id }, data: { status: 'INATIVO' } }); }

  lowStock() { return this.prisma.product.findMany({ where: { stock: { lte: this.prisma.product.fields.minStock } }, orderBy: { stock: 'asc' } }); }
}
