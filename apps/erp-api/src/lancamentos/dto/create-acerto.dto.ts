import { IsString, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAcertoDto {
  @IsDateString()
  data: string;

  @IsString()
  cliente: string;

  @IsOptional()
  @Type(() => Number)
  cotacao?: number;

  @Type(() => Number)
  juros: number;

  @Type(() => Number)
  liquido: number;

  @IsOptional()
  @IsString()
  obs?: string;
}
