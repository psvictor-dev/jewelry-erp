import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Estoque')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private stock: StockService) {}

  @Post('movement')
  @ApiOperation({ summary: 'Registrar movimentação de estoque' })
  addMovement(@Body() body: any, @Request() req: any) {
    return this.stock.addMovement({ ...body, userId: req.user.id });
  }

  @Get('movements/:productId')
  @ApiOperation({ summary: 'Histórico de movimentações de um produto' })
  findMovements(@Param('productId') productId: string) {
    return this.stock.findMovements(productId);
  }
}
