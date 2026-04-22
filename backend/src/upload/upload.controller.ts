import {
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { UploadService } from './upload.service';

type AuthenticatedRequest = Request & { user: JwtPayload };

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('user/avatar')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadUserAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.uploadService.updateUserAvatar(req.user.userId, file.filename);
  }

  @Post('product/:id/image')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.uploadService.updateProductImage(
      id,
      file.filename,
      req.user.userId,
    );
  }
}
