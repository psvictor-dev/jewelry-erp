import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { CreateAcertoDto } from './dto/create-acerto.dto';
import { CreateVendaDto } from './dto/create-venda.dto';

@Injectable()
export class LancamentosService {
  constructor(private prisma: PrismaService) {}

  // ── Compras ─────────────────────────────────────────────────────
  findAllCompras() {
    return this.prisma.lancamentoCompra.findMany({ orderBy: { data: 'desc' } });
  }

  findOneCompra(id: string) {
    return this.prisma.lancamentoCompra.findUniqueOrThrow({ where: { id } });
  }

  createCompra(dto: CreateCompraDto) {
    const preco = Number(dto.preco);
    const cotacao = dto.cotacao != null ? Number(dto.cotacao) : null;
    const totalBrl = dto.moeda === 'BRL'
      ? preco * dto.quantidade
      : cotacao != null
        ? preco * dto.quantidade * cotacao
        : null;

    return this.prisma.lancamentoCompra.create({
      data: {
        data: new Date(dto.data),
        fornecedor: dto.fornecedor,
        modelo: dto.modelo,
        quantidade: dto.quantidade,
        moeda: dto.moeda,
        preco,
        cotacao,
        totalBrl,
        obs: dto.obs ?? null,
      },
    });
  }

  deleteCompra(id: string) {
    return this.prisma.lancamentoCompra.delete({ where: { id } });
  }

  // ── Acertos ─────────────────────────────────────────────────────
  findAllAcertos() {
    return this.prisma.lancamentoAcerto.findMany({ orderBy: { data: 'desc' } });
  }

  findOneAcerto(id: string) {
    return this.prisma.lancamentoAcerto.findUniqueOrThrow({ where: { id } });
  }

  createAcerto(dto: CreateAcertoDto) {
    return this.prisma.lancamentoAcerto.create({
      data: {
        data: new Date(dto.data),
        cliente: dto.cliente,
        cotacao: dto.cotacao != null ? Number(dto.cotacao) : null,
        juros: Number(dto.juros),
        liquido: Number(dto.liquido),
        obs: dto.obs ?? null,
      },
    });
  }

  deleteAcerto(id: string) {
    return this.prisma.lancamentoAcerto.delete({ where: { id } });
  }

  // ── Vendas ──────────────────────────────────────────────────────
  findAllVendas() {
    return this.prisma.lancamentoVenda.findMany({ orderBy: { data: 'desc' } });
  }

  findOneVenda(id: string) {
    return this.prisma.lancamentoVenda.findUniqueOrThrow({ where: { id } });
  }

  createVenda(dto: CreateVendaDto) {
    return this.prisma.lancamentoVenda.create({
      data: {
        data: new Date(dto.data),
        cliente: dto.cliente,
        modelo: dto.modelo,
        quantidade: dto.quantidade,
        valor: Number(dto.valor),
        valorLiquido: dto.valorLiquido != null ? Number(dto.valorLiquido) : null,
        formaPagamento: dto.formaPagamento,
        vendedor: dto.vendedor ?? null,
        obsVenda: dto.obsVenda ?? null,
        cpfNf: dto.cpfNf ?? null,
      },
    });
  }

  deleteVenda(id: string) {
    return this.prisma.lancamentoVenda.delete({ where: { id } });
  }
}
