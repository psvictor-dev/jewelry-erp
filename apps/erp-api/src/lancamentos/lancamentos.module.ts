import { Module } from '@nestjs/common';
import { LancamentosService } from './lancamentos.service';
import { LancamentosController } from './lancamentos.controller';

@Module({ providers: [LancamentosService], controllers: [LancamentosController] })
export class LancamentosModule {}
