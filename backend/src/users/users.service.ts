import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }): Promise<{
    data: SafeUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' as const } },
          { email: { contains: params.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(params.role && { role: params.role }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users.map((u) => this.toSafeUser(u)), total, page, limit };
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.toSafeUser(user);
  }

  async create(dto: CreateUserDto, performedBy: string): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
    });

    await this.auditLog.log({
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      performedBy,
    });

    return this.toSafeUser(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    performedBy: string,
  ): Promise<SafeUser> {
    await this.findOne(id);

    const data: Partial<User> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({ where: { id }, data });

    await this.auditLog.log({
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      performedBy,
    });

    return this.toSafeUser(user);
  }

  async remove(id: string, performedBy: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });

    await this.auditLog.log({
      action: 'DELETE',
      entity: 'User',
      entityId: id,
      performedBy,
    });
  }

  private toSafeUser = (user: User): SafeUser => {
    const safe: Partial<User> = { ...user };
    delete safe.password;
    return safe as SafeUser;
  };
}
