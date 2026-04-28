import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LancamentosService } from './lancamentos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCompraDto } from './dto/create-compra.dto';
import { CreateAcertoDto } from './dto/create-acerto.dto';
import { CreateVendaDto } from './dto/create-venda.dto';

@ApiTags('Lançamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lancamentos')
export class LancamentosController {
  constructor(private lancamentos: LancamentosService) {}

  // ── Compras ─────────────────────────────────────────────────────
  @Get('compras') @ApiOperation({ summary: 'Listar compras' })
  findAllCompras() { return this.lancamentos.findAllCompras(); }

  @Get('compras/:id') @ApiOperation({ summary: 'Buscar compra' })
  findOneCompra(@Param('id') id: string) { return this.lancamentos.findOneCompra(id); }

  @Post('compras') @ApiOperation({ summary: 'Criar compra' })
  createCompra(@Body() dto: CreateCompraDto) { return this.lancamentos.createCompra(dto); }

  @Delete('compras/:id') @ApiOperation({ summary: 'Deletar compra' })
  deleteCompra(@Param('id') id: string) { return this.lancamentos.deleteCompra(id); }

  // ── Acertos ─────────────────────────────────────────────────────
  @Get('acertos') @ApiOperation({ summary: 'Listar acertos' })
  findAllAcertos() { return this.lancamentos.findAllAcertos(); }

  @Get('acertos/:id') @ApiOperation({ summary: 'Buscar acerto' })
  findOneAcerto(@Param('id') id: string) { return this.lancamentos.findOneAcerto(id); }

  @Post('acertos') @ApiOperation({ summary: 'Criar acerto' })
  createAcerto(@Body() dto: CreateAcertoDto) { return this.lancamentos.createAcerto(dto); }

  @Delete('acertos/:id') @ApiOperation({ summary: 'Deletar acerto' })
  deleteAcerto(@Param('id') id: string) { return this.lancamentos.deleteAcerto(id); }

  // ── Vendas ──────────────────────────────────────────────────────
  @Get('vendas') @ApiOperation({ summary: 'Listar vendas' })
  findAllVendas() { return this.lancamentos.findAllVendas(); }

  @Get('vendas/:id') @ApiOperation({ summary: 'Buscar venda' })
  findOneVenda(@Param('id') id: string) { return this.lancamentos.findOneVenda(id); }

  @Post('vendas') @ApiOperation({ summary: 'Criar venda' })
  createVenda(@Body() dto: CreateVendaDto) { return this.lancamentos.createVenda(dto); }

  @Delete('vendas/:id') @ApiOperation({ summary: 'Deletar venda' })
  deleteVenda(@Param('id') id: string) { return this.lancamentos.deleteVenda(id); }
}
