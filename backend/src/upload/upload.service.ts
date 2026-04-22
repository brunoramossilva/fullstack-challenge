import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUserAvatar(userId: string, filename: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: `/uploads/${filename}` },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProductImage(
    productId: string,
    filename: string,
    userId: string,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, ownerId: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.ownerId !== userId) {
      throw new ForbiddenException('You can only edit your own products');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl: `/uploads/${filename}` },
    });
  }
}
