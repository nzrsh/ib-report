import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    return await this.prisma.event.create({
      data: createEventDto,
    });
  }

  async findAll(skip = 0, take = 10) {
    const total = await this.prisma.event.count();

    const data = await this.prisma.event.findMany({
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
    return await this.prisma.event.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    return await this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.event.delete({
      where: { id },
    });
  }
}
