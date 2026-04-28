import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) { return this.prisma.user.findUnique({ where: { email } }); }

  findAll() { return this.prisma.user.findMany({ select: { id:true,name:true,email:true,role:true,active:true,createdAt:true } }); }

  findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id }, select: { id:true,name:true,email:true,role:true,active:true,createdAt:true } });
  }

  create(data: { name:string; email:string; password:string; role:UserRole }) {
    return this.prisma.user.create({ data });
  }

  async createWithPassword(data: { name:string; email:string; password:string; role:UserRole }) {
    const exists = await this.findByEmail(data.email);
    if (exists) throw new ConflictException('E-mail já cadastrado');
    const hash = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({ data: { ...data, password: hash } });
    const { password: _, ...result } = user;
    return result;
  }

  update(id: string, data: Partial<{ name:string; role:UserRole; active:boolean }>) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.user.update({ where: { id }, data: { active: false } });
    return { message: 'Usuário desativado com sucesso' };
  }
}
