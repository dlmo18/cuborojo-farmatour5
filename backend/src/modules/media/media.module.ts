import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname, join, isAbsolute } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdirSync, existsSync } from 'fs';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaItem } from './media.entity';

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip', 'application/x-rar-compressed',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MediaItem]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uploadDir = configService.get('UPLOAD_DIR', './uploads');
        const resolvedPath = isAbsolute(uploadDir) ? uploadDir : join(process.cwd(), uploadDir);
        
        // Crear la carpeta si no existe
        if (!existsSync(resolvedPath)) {
          mkdirSync(resolvedPath, { recursive: true });
        }

        return {
          storage: diskStorage({
            destination: resolvedPath,
            filename: (req, file, cb) => cb(null, `${uuidv4()}${extname(file.originalname)}`),
          }),
          fileFilter,
          limits: { fileSize: parseInt(configService.get('MAX_FILE_SIZE', '10485760')) },
        };
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
