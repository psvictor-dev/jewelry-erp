import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SalePdfService } from './sale-pdf.service';

@Module({ providers: [SalesService, SalePdfService], controllers: [SalesController] })
export class SalesModule {}
