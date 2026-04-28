import { IsString, IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVendaDto {
  @IsDateString()
  data: string;

  @IsString()
  cliente: string;

  @IsString()
  modelo: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantidade: number;

  @Type(() => Number)
  valor: number;

  @IsOptional()
  @Type(() => Number)
  valorLiquido?: number;

  @IsString()
  formaPagamento: string;

  @IsOptional()
  @IsString()
  vendedor?: string;

  @IsOptional()
  @IsString()
  obsVenda?: string;

  @IsOptional()
  @IsString()
  cpfNf?: string;
}
