import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Kết nối database khi mở
  async onModuleInit() {
    await this.$connect();
  }

  // Ngắt kết nối khi đóng ứng dụng
  async onModuleDestroy() {
    await this.$disconnect();
  }
}