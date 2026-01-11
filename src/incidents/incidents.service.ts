import { Injectable } from '@nestjs/common';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IncidentType } from '@prisma/client';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIncidentDto: CreateIncidentDto) {
    return await this.prisma.incident.create({
      data: createIncidentDto,
    });
  }

  async findAll(skip = 0, take = 10, type: IncidentType | null) {
    const total = await this.prisma.incident.count({
      where: { incidentType: type ?? { not: null } },
    });

    const data = await this.prisma.incident.findMany({
      where: { incidentType: type ?? { not: null } },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      total,
      skip,
      take,
      data,
    };
  }

  async findOne(id: number) {
    return await this.prisma.incident.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateIncidentDto: CreateIncidentDto) {
    return await this.prisma.incident.update({
      where: { id },
      data: updateIncidentDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.incident.delete({
      where: { id },
    });
  }
}
