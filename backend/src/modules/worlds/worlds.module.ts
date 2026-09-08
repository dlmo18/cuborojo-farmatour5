import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorldsService } from './worlds.service';
import { WorldsController } from './worlds.controller';
import { World } from './world.entity';

@Module({
  imports: [TypeOrmModule.forFeature([World])],
  controllers: [WorldsController],
  providers: [WorldsService],
  exports: [WorldsService],
})
export class WorldsModule {}
