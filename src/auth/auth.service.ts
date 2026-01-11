import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const isPasswordValid = this.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const payload = { sub: user.id, login: user.login, role: user.role };

    return {
      token: this.jwtService.sign(payload),
      role: user.role,
    };
  }

  private compare(pass1, pass2) {
    return pass1 === pass2;
  }

  async onApplicationBootstrap() {
    try {
      const password = 'changeme';
      const login = 'admin';
      const role = Role.admin;

      const admin: CreateUserDto = {
        password,
        login,
        role,
      };

      const user = await this.userService.create(admin);
      if (!user) {
        return;
      }
    } catch (err) {
      console.log('Администратор уже существует');
    }
  }
}
