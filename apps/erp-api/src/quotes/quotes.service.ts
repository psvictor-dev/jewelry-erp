import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  findAll(params?: { status?: string; customerId?: string }) {
    const where: any = {};
    if (params?.status)     where.status     = params.status;
    if (params?.customerId) where.customerId = params.customerId;
    return this.prisma.quote.findMany({
      where,
      include: { customer: true, user: { select: { id:true, name:true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.quote.findUniqueOrThrow({
      where: { id },
      include: { customer: true, user: { select: { id:true, name:true } }, items: { include: { product: true } } },
    });
  }

  async create(data: any, userId: string) {
    const { items, customerId, notes, validUntil, discount = 0 } = data;

    // Busca preços atuais
    const products = await Promise.all(
      items.map((i: any) => this.prisma.product.findUniqueOrThrow({ where: { id: i.productId } }))
    );

    const quoteItems = items.map((item: any, idx: number) => {
      const p = products[idx];
      const unitPrice = item.unitPrice ?? Number(p.salePrice);
      const itemDiscount = item.discount ?? 0;
      const total = (unitPrice - itemDiscount) * item.quantity;
      return { productId: item.productId, quantity: item.quantity, unitPrice, discount: itemDiscount, total };
    });

    const subtotal = quoteItems.reduce((s: number, i: any) => s + i.total, 0);
    const total = subtotal - Number(discount);

    return this.prisma.quote.create({
      data: {
        userId, customerId, notes, discount, total,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 86400000),
        items: { create: quoteItems },
      },
      include: { customer: true, items: { include: { product: true } } },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.quote.update({ where: { id }, data: { status: status as any } });
  }

  async convertToSale(quoteId: string, paymentMethod: string, userId: string) {
    const quote = await this.prisma.quote.findUniqueOrThrow({
      where: { id: quoteId },
      include: { items: { include: { product: true } }, sale: true },
    });

    if (quote.status !== 'APROVADO') throw new BadRequestException('Orçamento precisa estar APROVADO para converter em venda');
    if (quote.sale)                  throw new BadRequestException('Orçamento já foi convertido em venda');

    // Verifica estoque
    for (const item of quote.items) {
      if (Number(item.product.stock) < item.quantity)
        throw new BadRequestException(`Estoque insuficiente para: ${item.product.name}`);
    }

    const saleItems = quote.items.map(i => ({
      productId: i.productId,
      quantity:  i.quantity,
      unitPrice: i.unitPrice,
      costPrice: i.product.costPrice,
      discount:  i.discount,
      total:     i.total,
    }));

    const [sale] = await this.prisma.$transaction([
      // Cria venda
      this.prisma.sale.create({
        data: {
          userId, quoteId, paymentMethod: paymentMethod as any,
          discount: quote.discount, total: quote.total,
          customerId: quote.customerId,
          status: 'PAGO', paidAt: new Date(),
          items: { create: saleItems },
          transactions: { create: {
            type: 'RECEITA', status: 'PAGO', category: 'VENDA',
            description: `Venda - Orçamento #${quote.number}`,
            amount: quote.total, dueDate: new Date(), paidAt: new Date(),
            paymentMethod: paymentMethod as any,
          }},
        },
        include: { items: true, customer: true },
      }),
      // Atualiza status do orçamento
      this.prisma.quote.update({ where: { id: quoteId }, data: { status: 'APROVADO' } }),
      // Baixa estoque
      ...quote.items.map(item =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
      // Registra movimentações
      ...quote.items.map(item =>
        this.prisma.stockMovement.create({
          data: {
            type: 'SAIDA', quantity: item.quantity,
            reason: `Venda - Orçamento #${quote.number}`,
            productId: item.productId, userId,
          },
        })
      ),
    ]);

    return sale;
  }
}
