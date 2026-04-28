import { Controller, Get, Post, Body, Param, Query, Res, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { SalesService } from './sales.service';
import { SalePdfService } from './sale-pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Vendas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(
    private sales: SalesService,
    private pdf: SalePdfService,
  ) {}

  @Post() @ApiOperation({ summary: 'Criar venda' })
  create(@Body() body: any, @Request() req: any) { return this.sales.create(body, req.user.id); }

  @Get()    @ApiOperation({ summary: 'Listar vendas' })
  findAll(@Query() q: any) { return this.sales.findAll(q); }

  @Get(':id/pdf') @ApiOperation({ summary: 'Gerar PDF da venda' })
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const sale = await this.sales.findOne(id) as any;
    const buffer = await this.pdf.generate(sale);
    const date = new Date(sale.data ?? sale.createdAt);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const clientName = (sale.customer?.name ?? 'BALCAO')
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '')
      .trim();
    const filename = `${dd}-${mm} ${clientName}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id') @ApiOperation({ summary: 'Buscar venda' })
  findOne(@Param('id') id: string) { return this.sales.findOne(id); }
}
