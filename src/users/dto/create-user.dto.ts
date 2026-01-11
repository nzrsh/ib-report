import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  login: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;
}

export class PaginationUser {
  skip: string;
  take: string;
}
