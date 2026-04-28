import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@erp-joalheria.com' })
  @IsEmail() email: string;

  @ApiProperty({ example: 'Admin@2024' })
  @IsString() password: string;
}
