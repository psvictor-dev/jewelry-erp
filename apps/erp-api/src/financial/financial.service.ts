import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  findAll(params?: { type?: string; status?: string; from?: string; to?: string; category?: string }) {
    const where: any = {};
    if (params?.type)     where.type     = params.type;
    if (params?.status)   where.status   = params.status;
    if (params?.category) where.category = params.category;
    if (params?.from || params?.to) {
      where.dueDate = {};
      if (params.from) where.dueDate.gte = new Date(params.from);
      if (params.to)   where.dueDate.lte = new Date(params.to);
    }
    return this.prisma.transaction.findMany({
      where, orderBy: { dueDate: 'asc' },
    });
  }

  findOne(id: string) { return this.prisma.transaction.findUniqueOrThrow({ where: { id } }); }

  create(data: any)  { return this.prisma.transaction.create({ data }); }

  update(id: string, data: any) { return this.prisma.transaction.update({ where: { id }, data }); }

  async markPaid(id: string, paymentMethod: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'PAGO', paidAt: new Date(), paymentMethod: paymentMethod as any },
    });
  }

  async getDRE(month: number, year: number) {
    const from = new Date(year, month - 1, 1);
    const to   = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: { dueDate: { gte: from, lte: to } },
    });

    const paid = transactions.filter(t => t.status === 'PAGO');

    const receitas = paid.filter(t => t.type === 'RECEITA');
    const despesas = paid.filter(t => t.type === 'DESPESA');

    const totalReceitas = receitas.reduce((s, t) => s + Number(t.amount), 0);
    const totalDespesas = despesas.reduce((s, t) => s + Number(t.amount), 0);

    // CMV = compras de estoque
    const cmv = despesas.filter(t => t.category === 'COMPRA_ESTOQUE').reduce((s, t) => s + Number(t.amount), 0);
    const lucroBruto = totalReceitas - cmv;
    const despesasOp = totalDespesas - cmv;
    const lucroLiquido = lucroBruto - despesasOp;
    const margem = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0;

    // Vendas do período (para ticket médio)
    const vendas = await this.prisma.sale.findMany({
      where: { createdAt: { gte: from, lte: to }, status: 'PAGO' },
    });
    const ticketMedio = vendas.length > 0
      ? vendas.reduce((s, v) => s + Number(v.total), 0) / vendas.length
      : 0;

    // Por categoria
    const byCat = despesas.reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + Number(t.amount);
      return acc;
    }, {});

    return {
      periodo: { mes: month, ano: year, de: from, ate: to },
      receitas: {
        total: totalReceitas,
        items: receitas.map(t => ({ description: t.description, amount: Number(t.amount), category: t.category })),
      },
      cmv,
      lucroBruto,
      despesasOperacionais: {
        total: despesasOp,
        porCategoria: byCat,
        items: despesas.filter(t => t.category !== 'COMPRA_ESTOQUE')
          .map(t => ({ description: t.description, amount: Number(t.amount), category: t.category })),
      },
      lucroLiquido,
      margemLiquida: Number(margem.toFixed(2)),
      totalVendas: vendas.length,
      ticketMedio: Number(ticketMedio.toFixed(2)),
      pendentes: {
        receitas: transactions.filter(t => t.type === 'RECEITA' && t.status === 'PENDENTE').reduce((s,t) => s + Number(t.amount), 0),
        despesas: transactions.filter(t => t.type === 'DESPESA' && t.status === 'PENDENTE').reduce((s,t) => s + Number(t.amount), 0),
      },
    };
  }

  async getCashFlow(days = 30) {
    const from = new Date(); from.setDate(from.getDate() - days);
    const to   = new Date(); to.setDate(to.getDate() + 30);

    const transactions = await this.prisma.transaction.findMany({
      where: { dueDate: { gte: from, lte: to } },
      orderBy: { dueDate: 'asc' },
    });

    let saldo = 0;
    const flow = transactions.map(t => {
      const v = t.type === 'RECEITA' ? Number(t.amount) : -Number(t.amount);
      saldo += t.status === 'PAGO' ? v : 0;
      return {
        date:        t.dueDate,
        description: t.description,
        type:        t.type,
        status:      t.status,
        amount:      Number(t.amount),
        saldoAcumulado: saldo,
      };
    });

    return { saldoAtual: saldo, flow };
  }
}
