import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DocsModule } from './docs/docs.module';
import { EventsModule } from './events/events.module';
import { IncidentsModule } from './incidents/incidents.module';
import { StaticPagesModule } from './static-pages/static-pages.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { StaticPagesController } from './static-pages/static-pages.controller';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    DocsModule,
    EventsModule,
    IncidentsModule,
    StaticPagesModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'static'),
      serveRoot: '/static',
    }),
  ],
  controllers: [StaticPagesController],
})
export class AppModule {}
