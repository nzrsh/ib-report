import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // ← вот так!
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaBetterSqlite3({
      // для SQLite в Node.js обычно просто путь к файлу
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
