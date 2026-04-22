import { Injectable } from '@nestjs/common';
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

  async updateProductImage(productId: string, filename: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl: `/uploads/${filename}` },
    });
  }
}
