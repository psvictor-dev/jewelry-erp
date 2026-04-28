import { IsString, IsInt, IsNumber, IsOptional, IsNumberString, IsDateString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompraDto {
  @IsDateString()
  data: string;

  @IsString()
  fornecedor: string;

  @IsString()
  modelo: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantidade: number;

  @IsIn(['BRL', 'USD', 'EUR', 'ARS', 'AU'])
  moeda: string;

  @IsNumber()
  @Type(() => Number)
  preco: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cotacao?: number;

  @IsOptional()
  @IsString()
  obs?: string;
}
