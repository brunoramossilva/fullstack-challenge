import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.interface';

type SafeUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return this.toSafeUser(user);
  }

  async login(
    user: Pick<SafeUser, 'id' | 'email' | 'role'>,
  ): Promise<{ access_token: string }> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<SafeUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.getSaltRounds(),
    );

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name?.trim() || registerDto.email.split('@')[0],
      },
    });

    return this.toSafeUser(user);
  }

  private getSaltRounds(): number {
    const configuredValue =
      this.configService.get<string>('BCRYPT_SALT_ROUNDS');

    if (!configuredValue) {
      return 10;
    }

    const parsedValue = Number.parseInt(configuredValue, 10);

    if (!Number.isFinite(parsedValue) || parsedValue < 4) {
      return 10;
    }

    return parsedValue;
  }

  private toSafeUser(user: User): SafeUser {
    const safeUser = { ...user } as Partial<User>;
    delete safeUser.password;

    return safeUser as SafeUser;
  }
}
