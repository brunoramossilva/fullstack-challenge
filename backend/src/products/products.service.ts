/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' as const } },
          {
            description: {
              contains: params.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
      ...(params.categoryId && {
        categories: { some: { categoryId: params.categoryId } },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          categories: { include: { category: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        categories: { include: { category: true } },
        favorites: { select: { userId: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto, ownerId: string) {
    const { categoryIds, ...data } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...data,
        ownerId,
        ...(categoryIds?.length && {
          categories: {
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
      },
      include: { categories: { include: { category: true } } },
    });

    await this.auditLog.log({
      action: 'CREATE',
      entity: 'Product',
      entityId: product.id,
      performedBy: ownerId,
    });

    return product;
  }

  async update(id: string, dto: UpdateProductDto, performedBy: string) {
    await this.findOne(id);
    const { categoryIds, ...data } = dto;

    if (categoryIds !== undefined) {
      await this.prisma.productCategory.deleteMany({
        where: { productId: id },
      });
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(categoryIds?.length && {
          categories: {
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
      },
      include: { categories: { include: { category: true } } },
    });

    await this.auditLog.log({
      action: 'UPDATE',
      entity: 'Product',
      entityId: id,
      performedBy,
    });

    return product;
  }

  async remove(id: string, performedBy: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.productCategory.deleteMany({ where: { productId: id } });
    await this.prisma.favorite.deleteMany({ where: { productId: id } });
    await this.prisma.product.delete({ where: { id } });

    await this.auditLog.log({
      action: 'DELETE',
      entity: 'Product',
      entityId: id,
      performedBy,
    });
  }

  async toggleFavorite(productId: string, userId: string) {
    await this.findOne(productId);

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { userId_productId: { userId, productId } },
      });
      return { favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, productId } });
    return { favorited: true };
  }

  async findFavorites(userId: string) {
    return this.prisma.product.findMany({
      where: { favorites: { some: { userId } } },
      include: {
        categories: { include: { category: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
