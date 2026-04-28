import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    const { items, customerId, paymentMethod, discount = 0, notes, installments = 1, data: saleDate } = data;

    // Busca produtos e preços
    const products = await Promise.all(
      items.map((i: any) => this.prisma.product.findUniqueOrThrow({ where: { id: i.productId } }))
    );

    // Verifica estoque
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const product = products[idx];
      if (Number(product.stock) < item.quantity) {
        throw new BadRequestException(`Estoque insuficiente para: ${product.name}`);
      }
    }

    const saleItems = items.map((item: any, idx: number) => {
      const p = products[idx];
      const unitPrice = item.unitPrice ?? Number(p.salePrice);
      const itemDiscount = item.discount ?? 0;
      const total = (unitPrice - itemDiscount) * item.quantity;
      return { productId: item.productId, quantity: item.quantity, unitPrice, costPrice: p.costPrice, discount: itemDiscount, total };
    });

    const subtotal = saleItems.reduce((s: number, i: any) => s + i.total, 0);
    const total = subtotal - Number(discount);

    const [sale] = await this.prisma.$transaction([
      this.prisma.sale.create({
        data: {
          userId, customerId, paymentMethod, discount, total, notes, installments,
          status: 'PAGO', paidAt: new Date(),
          data: saleDate ? new Date(saleDate) : new Date(),
          items: { create: saleItems },
          transactions: { create: {
            type: 'RECEITA', status: 'PAGO', category: 'VENDA',
            description: `Venda direta`,
            amount: total, dueDate: new Date(), paidAt: new Date(),
            paymentMethod,
          }},
        },
        include: { items: { include: { product: true } }, customer: true, user: { select: { id: true, name: true } } },
      }),
      // Baixa estoque
      ...items.map((item: any) =>
        this.prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
      ),
      ...items.map((item: any, idx: number) =>
        this.prisma.stockMovement.create({
          data: { type: 'SAIDA', quantity: item.quantity, reason: 'Venda direta', productId: item.productId, userId },
        })
      ),
    ]);

    return sale;
  }

  findAll(params?: { status?: string; customerId?: string; from?: string; to?: string }) {
    const where: any = {};
    if (params?.status)     where.status     = params.status;
    if (params?.customerId) where.customerId = params.customerId;
    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to)   where.createdAt.lte = new Date(params.to);
    }
    return this.prisma.sale.findMany({
      where,
      include: {
        customer: true,
        user: { select: { id:true, name:true } },
        items: { include: { product: { select: { id:true, sku:true, name:true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.sale.findUniqueOrThrow({
      where: { id },
      include: {
        customer: true,
        user: { select: { id:true, name:true } },
        items: { include: { product: true } },
        transactions: true,
      },
    });
  }
}
