import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './activity-log.entity';
import { MissionProgress } from './entities/mission-progress.entity';
import { LevelProgress } from './entities/level-progress.entity';
import { WorldProgress } from './entities/world-progress.entity';
import { ParticipantAnswer } from './entities/participant-answer.entity';
import { WorldExamAnswer } from './entities/world-exam-answer.entity';
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
