import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createEmployee(data: any) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { cccd: data.cccd }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Username hoặc CCCD đã tồn tại');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    return this.prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        cccd: data.cccd,
        role: 'FILLER',
        avatarUrl: data.avatarUrl || null,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        cccd: true,
        role: true,
        avatarUrl: true,
      },
    });
  }
}