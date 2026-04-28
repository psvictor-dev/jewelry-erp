import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    const where: any = { active: true };
    if (search) where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { cpf:   { contains: search } },
    ];
    return this.prisma.customer.findMany({ where, orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.customer.findUniqueOrThrow({
      where: { id },
      include: {
        quotes: { orderBy: { createdAt: 'desc' }, take: 5 },
        sales:  { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  create(data: any)              { return this.prisma.customer.create({ data }); }
  update(id: string, data: any)  { return this.prisma.customer.update({ where: { id }, data }); }
  remove(id: string)             { return this.prisma.customer.update({ where: { id }, data: { active: false } }); }
}
