import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [IncidentsController],
  providers: [IncidentsService, PrismaService],
})
export class IncidentsModule {}
