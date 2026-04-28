import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockMovementType } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async addMovement(dto: { productId: string; type: StockMovementType; quantity: number; reason?: string; userId: string; referenceId?: string }) {
    const product = await this.prisma.product.findUniqueOrThrow({ where: { id: dto.productId } });

    const delta = dto.type === 'SAIDA' ? -Math.abs(dto.quantity) : Math.abs(dto.quantity);
    if (Number(product.stock) + delta < 0) throw new BadRequestException('Estoque insuficiente');

    const [movement] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({ data: { ...dto } }),
      this.prisma.product.update({ where: { id: dto.productId }, data: { stock: { increment: delta } } }),
    ]);
    return movement;
  }

  findMovements(productId: string) {
    return this.prisma.stockMovement.findMany({
      where: { productId },
      include: { user: { select: { id:true, name:true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
