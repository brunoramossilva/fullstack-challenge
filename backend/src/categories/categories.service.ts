import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: Category[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(params.search && {
        name: { contains: params.search, mode: 'insensitive' as const },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto, ownerId: string): Promise<Category> {
    return this.prisma.category.create({
      data: { name: dto.name, ownerId },
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
  }
}
