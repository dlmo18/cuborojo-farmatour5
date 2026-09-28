import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HowToPlayController } from './how-to-play.controller';
import { HowToPlayService } from './how-to-play.service';
import { HowToPlay } from './how-to-play.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HowToPlay])],
  controllers: [HowToPlayController],
  providers: [HowToPlayService],
  exports: [HowToPlayService],
})
export class HowToPlayModule {}
