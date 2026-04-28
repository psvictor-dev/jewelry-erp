import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Financeiro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial')
export class FinancialController {
  constructor(private financial: FinancialService) {}

  @Get('transactions') @ApiOperation({ summary: 'Listar transações' })
  findAll(@Query() q: any) { return this.financial.findAll(q); }

  @Get('transactions/:id') @ApiOperation({ summary: 'Buscar transação' })
  findOne(@Param('id') id: string) { return this.financial.findOne(id); }

  @Post('transactions') @ApiOperation({ summary: 'Criar transação' })
  create(@Body() body: any) { return this.financial.create(body); }

  @Put('transactions/:id') @ApiOperation({ summary: 'Atualizar transação' })
  update(@Param('id') id: string, @Body() body: any) { return this.financial.update(id, body); }

  @Put('transactions/:id/pay') @ApiOperation({ summary: 'Marcar como pago' })
  markPaid(@Param('id') id: string, @Body('paymentMethod') pm: string) {
    return this.financial.markPaid(id, pm);
  }

  @Get('dre') @ApiOperation({ summary: 'DRE - Demonstrativo de Resultados' })
  @ApiQuery({ name:'month', required:false }) @ApiQuery({ name:'year', required:false })
  getDRE(@Query('month') month?: string, @Query('year') year?: string) {
    const now = new Date();
    return this.financial.getDRE(
      month ? parseInt(month) : now.getMonth() + 1,
      year  ? parseInt(year)  : now.getFullYear(),
    );
  }

  @Get('cashflow') @ApiOperation({ summary: 'Fluxo de caixa' })
  getCashFlow(@Query('days') days?: string) {
    return this.financial.getCashFlow(days ? parseInt(days) : 30);
  }
}
