import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Orçamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private quotes: QuotesService) {}

  @Get()    @ApiOperation({ summary: 'Listar orçamentos' })
  findAll(@Query() q: any) { return this.quotes.findAll(q); }

  @Get(':id') @ApiOperation({ summary: 'Buscar orçamento' })
  findOne(@Param('id') id: string) { return this.quotes.findOne(id); }

  @Post() @ApiOperation({ summary: 'Criar orçamento' })
  create(@Body() body: any, @Request() req: any) { return this.quotes.create(body, req.user.id); }

  @Put(':id/status') @ApiOperation({ summary: 'Atualizar status do orçamento' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.quotes.updateStatus(id, status);
  }

  @Post(':id/convert') @ApiOperation({ summary: 'Converter orçamento em venda' })
  convertToSale(@Param('id') id: string, @Body('paymentMethod') pm: string, @Request() req: any) {
    return this.quotes.convertToSale(id, pm, req.user.id);
  }
}
