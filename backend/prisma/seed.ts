import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, User, Category, Product } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

const USERS_COUNT = 8;
const CATEGORIES_PER_USER = 4;
const PRODUCTS_PER_USER = 6;

async function main() {
  console.log('🌱 Iniciando seed...');

  // Clean up existing data
  await prisma.favorite.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);

  // USERS
  const users: User[] = [];

  for (let i = 0; i < USERS_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
        role: i === 0 ? Role.ADMIN : Role.USER,
        avatar: faker.image.avatar(),
      },
    });
    users.push(user);
  }

  console.log(`👤 ${users.length} usuários criados`);

  // CATEGORIES
  const categories: Category[] = [];

  for (const user of users) {
    for (let i = 0; i < CATEGORIES_PER_USER; i++) {
      const category = await prisma.category.create({
        data: {
          name: faker.commerce.department(),
          ownerId: user.id,
        },
      });
      categories.push(category);
    }
  }

  console.log(`📂 ${categories.length} categorias criadas`);

  // PRODUCTS
  const products: Product[] = [];

  for (const user of users) {
    for (let i = 0; i < PRODUCTS_PER_USER; i++) {
      const product = await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          imageUrl: faker.image.urlPicsumPhotos(),
          ownerId: user.id,
        },
      });
      products.push(product);
    }
  }

  console.log(`📦 ${products.length} produtos criados`);

  // PRODUCT <> CATEGORY
  const productCategoryData: { productId: string; categoryId: string }[] = [];

  for (const product of products) {
    const randomCategories = faker.helpers.arrayElements(
      categories,
      faker.number.int({ min: 1, max: 3 }),
    );

    for (const category of randomCategories) {
      productCategoryData.push({
        productId: product.id,
        categoryId: category.id,
      });
    }
  }

  await prisma.productCategory.createMany({
    data: productCategoryData,
    skipDuplicates: true,
  });

  console.log('🔗 Relações produto-categoria criadas');

  // FAVORITES
  const favoritesData: { userId: string; productId: string }[] = [];

  for (const user of users) {
    const randomProducts = faker.helpers.arrayElements(
      products,
      faker.number.int({ min: 2, max: 6 }),
    );

    for (const product of randomProducts) {
      favoritesData.push({
        userId: user.id,
        productId: product.id,
      });
    }
  }

  await prisma.favorite.createMany({
    data: favoritesData,
    skipDuplicates: true,
  });

  console.log('⭐ Favoritos criados');

  // NOTIFICATIONS
  for (const user of users) {
    const count = faker.number.int({ min: 1, max: 4 });

    for (let i = 0; i < count; i++) {
      await prisma.notification.create({
        data: {
          message: faker.lorem.sentence(),
          userId: user.id,
          read: faker.datatype.boolean(),
        },
      });
    }
  }

  console.log('🔔 Notificações criadas');

  // AUDIT LOGS
  const actions = ['CREATE', 'UPDATE', 'DELETE'];

  for (const user of users) {
    const count = faker.number.int({ min: 3, max: 8 });

    for (let i = 0; i < count; i++) {
      const product = faker.helpers.arrayElement(products);

      await prisma.auditLog.create({
        data: {
          action: faker.helpers.arrayElement(actions),
          entity: 'Product',
          entityId: product.id,
          performedBy: user.id,
        },
      });
    }
  }

  console.log('📜 Audit logs criados');
  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
console.log('DATABASE_URL:', process.env.DATABASE_URL);
