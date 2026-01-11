import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Res,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto, PaginationEvents } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import * as fs from 'fs';
import * as path from 'path';
import { generateEventsPDF } from 'src/utils/pdfgenerator';

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll(@Query() p: PaginationEvents) {
    const skip = Number(p.skip);
    const take = Number(p.take);
    return this.eventsService.findAll(skip, take);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  @Get(':id/doc')
  async generateEventDoc(@Param('id') id: string, @Res() res: Response) {
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new BadRequestException('Bad request');
    }

    const event = await this.eventsService.findOne(numId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const outputPath = path.resolve(
      process.cwd(),
      'tmp',
      `event_doc-${event.number}.pdf`,
    );

    try {
      await generateEventsPDF(event, outputPath);

      if (!fs.existsSync(outputPath)) {
        throw new InternalServerErrorException('Failed to generate PDF');
      }

      return res.redirect(`/docs/event/${event.number}`);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
