import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './activity-log.entity';
import { MissionProgress, LevelProgress, WorldProgress, ParticipantAnswer, WorldExamAnswer } from './progress.service';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLog, MissionProgress, LevelProgress, WorldProgress, ParticipantAnswer, WorldExamAnswer]),
    QuestionsModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
