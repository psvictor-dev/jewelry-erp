import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Fornecedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliers: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar fornecedores' })
  findAll(@Query('search') search?: string) { return this.suppliers.findAll(search); }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar fornecedor por ID' })
  findOne(@Param('id') id: string) { return this.suppliers.findOne(id); }

  @Post()
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Criar fornecedor' })
  create(@Body() body: any) { return this.suppliers.create(body); }

  @Put(':id')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  update(@Param('id') id: string, @Body() body: any) { return this.suppliers.update(id, body); }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativar fornecedor' })
  remove(@Param('id') id: string) { return this.suppliers.remove(id); }
}
