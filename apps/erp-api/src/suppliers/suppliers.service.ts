import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.supplier.findMany({
      where: search
        ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { cnpj: { contains: search } }, { email: { contains: search, mode: 'insensitive' } }] }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.supplier.findUniqueOrThrow({ where: { id } });
  }

  create(data: { name: string; cnpj?: string; email?: string; phone?: string; contact?: string; address?: string; notes?: string }) {
    return this.prisma.supplier.create({ data });
  }

  update(id: string, data: Partial<{ name: string; cnpj: string; email: string; phone: string; contact: string; address: string; notes: string; active: boolean }>) {
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.supplier.update({ where: { id }, data: { active: false } });
    return { message: 'Fornecedor desativado com sucesso' };
  }
}
