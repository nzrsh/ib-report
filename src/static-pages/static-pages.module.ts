import { Module } from '@nestjs/common';

import { StaticPagesController } from './static-pages.controller';

@Module({
  controllers: [StaticPagesController],
  providers: [],
})
export class StaticPagesModule {}
