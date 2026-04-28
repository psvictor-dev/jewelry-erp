import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Produtos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar produtos' })
  @ApiQuery({ name: 'search',     required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'page',       required: false, type: Number })
  @ApiQuery({ name: 'limit',      required: false, type: Number })
  findAll(@Query() q: any) { return this.products.findAll(q); }

  @Get('low-stock')
  @ApiOperation({ summary: 'Produtos com estoque baixo' })
  lowStock() { return this.products.lowStock(); }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  findOne(@Param('id') id: string) { return this.products.findOne(id); }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ESTOQUISTA')
  @ApiOperation({ summary: 'Criar produto' })
  create(@Body() body: any) { return this.products.create(body); }

  @Put(':id')
  @Roles('ADMIN', 'GERENTE', 'ESTOQUISTA')
  @ApiOperation({ summary: 'Atualizar produto' })
  update(@Param('id') id: string, @Body() body: any) { return this.products.update(id, body); }

  @Delete(':id')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Desativar produto' })
  remove(@Param('id') id: string) { return this.products.remove(id); }
}
