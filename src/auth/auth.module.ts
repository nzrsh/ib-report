import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY_2025',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
