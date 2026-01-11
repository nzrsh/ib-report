import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';

@Controller('docs')
export class DocsController {
  @Get(':type/:number')
  async getDoc(
    @Param('type') type: 'event' | 'incident',
    @Param('number') number: string,
    @Res() res: Response,
  ) {
    // const fileName = `${type}_doc-${number}.pdf`;

    const filePath = path.resolve(
      process.cwd(),
      'tmp',
      `${type}_doc-${number}.pdf`,
    );
    console.log(filePath);

    try {
      await fs.access(filePath);

      return res.sendFile(filePath, {
        headers: { 'Content-Disposition': 'inline' },
      });
    } catch (err: any) {
      console.error(err);

      if (err.code === 'ENOENT') {
        throw new NotFoundException('File not found');
      }

      throw new InternalServerErrorException('Failed to read file');
    }
  }
}
