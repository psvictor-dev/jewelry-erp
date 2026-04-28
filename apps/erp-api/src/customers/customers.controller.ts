import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customers: CustomersService) {}

  @Get()    @ApiOperation({ summary: 'Listar clientes' }) @ApiQuery({ name:'search', required:false })
  findAll(@Query('search') search?: string) { return this.customers.findAll(search); }

  @Get(':id') @ApiOperation({ summary: 'Buscar cliente' })
  findOne(@Param('id') id: string) { return this.customers.findOne(id); }

  @Post()   @ApiOperation({ summary: 'Criar cliente' })
  create(@Body() body: any) { return this.customers.create(body); }

  @Put(':id') @ApiOperation({ summary: 'Atualizar cliente' })
  update(@Param('id') id: string, @Body() body: any) { return this.customers.update(id, body); }

  @Delete(':id') @ApiOperation({ summary: 'Desativar cliente' })
  remove(@Param('id') id: string) { return this.customers.remove(id); }
}
