import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
  Res,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import {
  CreateIncidentDto,
  PaginationIncident,
} from './dto/create-incident.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import * as fs from 'fs';
import * as path from 'path';
import { generateIncidentsPDF } from 'src/utils/pdfgenerator';

@Controller('api/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() createIncidentDto: CreateIncidentDto) {
    return this.incidentsService.create(createIncidentDto);
  }

  @Get()
  findAll(@Query() p: PaginationIncident) {
    const skip = Number(p.skip);
    const take = Number(p.take);
    const type = p.type ?? null;
    return this.incidentsService.findAll(skip, take, type);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.incidentsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateIncidentDto: CreateIncidentDto,
  ) {
    return this.incidentsService.update(+id, updateIncidentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(+id);
  }

  @Get(':id/doc')
  async generateIncidentDoc(@Param('id') id: string, @Res() res: Response) {
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new BadRequestException('Bad request');
    }

    const incident = await this.incidentsService.findOne(numId);
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    const outputPath = path.resolve(
      process.cwd(),
      'tmp',
      `incident_doc-${incident.incidentNumber}.pdf`,
    );
    try {
      await generateIncidentsPDF(incident, outputPath);

      if (!fs.existsSync(outputPath)) {
        throw new InternalServerErrorException('Failed to generate PDF');
      }

      return res.redirect(`/docs/incident/${incident.incidentNumber}`);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
