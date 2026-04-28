import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString() name: string;

  @ApiProperty({ example: 'joao@joalheria.com' })
  @IsEmail() email: string;

  @ApiProperty({ example: 'Senha@2024', minLength: 8 })
  @IsString() @MinLength(8) password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.VENDEDOR })
  @IsEnum(UserRole) role: UserRole;
}
