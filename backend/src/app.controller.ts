import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { AppService } from './app.service';
import { Roles } from './auth/decorators/roles.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtPayload } from './auth/types/jwt-payload.interface';

type AuthenticatedRequest = Request & { user: JwtPayload };

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  getProtected(@Req() req: AuthenticatedRequest) {
    return {
      message: 'Authenticated route',
      user: req.user,
    };
  }

  @Get('admin')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminRoute(@Req() req: AuthenticatedRequest) {
    return {
      message: 'Admin-only route',
      user: req.user,
    };
  }
}
