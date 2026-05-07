import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PRODUCAO_PIPELINE: Record<string, string> = {
  RECEBIDO:   'EM_PRODUCAO',
  EM_PRODUCAO: 'ENTREGUE',
};

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    const { items, customerId, paymentMethod, discount = 0, notes, installments = 1, data: saleDate, entregaImediata = false } = data;

    const products = await Promise.all(
      items.map((i: any) => this.prisma.product.findUniqueOrThrow({ where: { id: i.productId } }))
    );

    if (entregaImediata) {
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const product = products[idx];
        if (Number(product.stock) < item.quantity) {
          throw new BadRequestException(`Estoque insuficiente para: ${product.name}`);
        }
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
    const status = entregaImediata ? 'ENTREGUE' : 'RECEBIDO';

    const ops: any[] = [
      this.prisma.sale.create({
        data: {
          userId, customerId, paymentMethod, discount, total, notes, installments,
          status: status as any,
          paidAt: entregaImediata ? new Date() : null,
          data: saleDate ? new Date(saleDate) : new Date(),
          items: { create: saleItems },
          ...(entregaImediata && {
            transactions: { create: {
              type: 'RECEITA', status: 'PAGO', category: 'VENDA',
              description: 'Venda direta',
              amount: total, dueDate: new Date(), paidAt: new Date(),
              paymentMethod,
            }},
          }),
        },
        include: { items: { include: { product: true } }, customer: true, user: { select: { id: true, name: true } } },
      }),
    ];

    if (entregaImediata) {
      ops.push(
        ...items.map((item: any) =>
          this.prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
        ),
        ...items.map((item: any) =>
          this.prisma.stockMovement.create({
            data: { type: 'SAIDA', quantity: item.quantity, reason: 'Venda direta', productId: item.productId, userId },
          })
        ),
      );
    }

    const [sale] = await this.prisma.$transaction(ops);
    return sale;
  }

  async findAll(params?: { status?: string; customerId?: string; from?: string; to?: string; page?: string; limit?: string }) {
    const where: any = {};
    if (params?.status)     where.status     = params.status;
    if (params?.customerId) where.customerId = params.customerId;
    if (params?.from || params?.to) {
      where.data = {};
      if (params.from) where.data.gte = new Date(params.from);
      if (params.to)   where.data.lte = new Date(params.to);
    }

    const page  = Math.max(1, parseInt(params?.page  ?? '1',  10));
    const limit = Math.min(100, parseInt(params?.limit ?? '25', 10));
    const skip  = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
          items: { select: { id: true } },
        },
        orderBy: { data: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  findOne(id: string) {
    return this.prisma.sale.findUniqueOrThrow({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
        transactions: true,
      },
    });
  }

  async advanceStatus(id: string, userId: string) {
    const sale = await this.prisma.sale.findUniqueOrThrow({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    const nextStatus = PRODUCAO_PIPELINE[sale.status];
    if (!nextStatus) {
      throw new BadRequestException(`Venda com status "${sale.status}" não pode ser avançada`);
    }

    if (nextStatus === 'ENTREGUE') {
      for (const item of sale.items) {
        if (Number(item.product.stock) < item.quantity) {
          throw new BadRequestException(`Estoque insuficiente para: ${item.product.name}`);
        }
      }

      const [updated] = await this.prisma.$transaction([
        this.prisma.sale.update({
          where: { id },
          data: { status: 'ENTREGUE', paidAt: new Date() },
        }),
        this.prisma.transaction.create({
          data: {
            type: 'RECEITA', status: 'PAGO', category: 'VENDA',
            description: `Entrega - Venda #${sale.number}`,
            amount: sale.total, dueDate: new Date(), paidAt: new Date(),
            paymentMethod: sale.paymentMethod,
            saleId: id,
          },
        }),
        ...sale.items.map(item =>
          this.prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        ),
        ...sale.items.map(item =>
          this.prisma.stockMovement.create({
            data: {
              type: 'SAIDA', quantity: item.quantity,
              reason: `Entrega - Venda #${sale.number}`,
              productId: item.productId, userId,
            },
          })
        ),
      ]);
      return updated;
    }

    return this.prisma.sale.update({
      where: { id },
      data: { status: nextStatus as any },
    });
  }
}
