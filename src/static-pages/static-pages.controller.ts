import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller('')
export class StaticPagesController {
  private send(res: Response, file: string) {
    return res.sendFile(join(__dirname, '..', '../../static', file));
  }

  @Get('login')
  login(@Res() res: Response) {
    return this.send(res, 'login.html');
  }

  @Get('/')
  login1(@Res() res: Response) {
    return this.send(res, 'login.html');
  }

  @Get('event-table')
  events(@Res() res: Response) {
    return this.send(res, 'event-table.html');
  }

  @Get('event-details/:id')
  eventsDetails(@Res() res: Response) {
    return this.send(res, 'event-details.html');
  }

  @Get('incident-table/:type')
  incidents(@Res() res: Response) {
    return this.send(res, 'incident-table.html');
  }

  @Get('incident-details/:id')
  incidentsDetails(@Res() res: Response) {
    return this.send(res, 'incident-details.html');
  }

  @Get('form')
  form(@Res() res: Response) {
    return this.send(res, 'form.html');
  }

  @Get('users-table')
  users(@Res() res: Response) {
    return this.send(res, 'users-table.html');
  }
}
