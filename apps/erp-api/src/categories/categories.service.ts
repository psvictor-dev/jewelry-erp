import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}
  findAll()           { return this.prisma.category.findMany({ include: { _count: { select: { products: true } } } }); }
  findOne(id: string) { return this.prisma.category.findUniqueOrThrow({ where: { id } }); }
  create(data: { name: string; description?: string }) { return this.prisma.category.create({ data }); }
  update(id: string, data: any) { return this.prisma.category.update({ where: { id }, data }); }
  remove(id: string)  { return this.prisma.category.delete({ where: { id } }); }
}
