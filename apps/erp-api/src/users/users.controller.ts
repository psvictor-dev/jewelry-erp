import { Controller, Get, Post, Param, Put, Body, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Listar todos usuários' })
  findAll() { return this.users.findAll(); }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar usuário da equipe' })
  create(@Body() body: any) { return this.users.createWithPassword(body); }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@Param('id') id: string) { return this.users.findOne(id); }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(@Param('id') id: string, @Body() body: any) { return this.users.update(id, body); }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativar usuário' })
  remove(@Param('id') id: string) { return this.users.remove(id); }
}
