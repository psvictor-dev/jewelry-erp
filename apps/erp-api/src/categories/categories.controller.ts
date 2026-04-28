import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Categorias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get()    @ApiOperation({ summary: 'Listar categorias' })
  findAll() { return this.categories.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Buscar categoria' })
  findOne(@Param('id') id: string) { return this.categories.findOne(id); }

  @Post()   @ApiOperation({ summary: 'Criar categoria' })
  create(@Body() body: any) { return this.categories.create(body); }

  @Put(':id') @ApiOperation({ summary: 'Atualizar categoria' })
  update(@Param('id') id: string, @Body() body: any) { return this.categories.update(id, body); }

  @Delete(':id') @ApiOperation({ summary: 'Remover categoria' })
  remove(@Param('id') id: string) { return this.categories.remove(id); }
}
