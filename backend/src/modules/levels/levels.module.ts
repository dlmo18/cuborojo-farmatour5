import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelsService } from './levels.service';
import { LevelsController } from './levels.controller';
import { Level } from './level.entity';
import { LevelItem } from './level-item.entity';
import { GoldenLevelItem } from './golden-level-item.entity';
import { GoldenLevelQuestion } from './golden-level-question.entity';
import { GoldenLevelAnswerOption } from './golden-level-answer-option.entity';
import { FinalLevelQuestion } from './final-level-question.entity';
import { FinalLevelAnswerOption } from './final-level-answer-option.entity';
import { GoldenLevelsService } from './golden-levels.service';
import { FinalLevelsService } from './final-levels.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Level,
      LevelItem,
      GoldenLevelItem,
      GoldenLevelQuestion,
      GoldenLevelAnswerOption,
      FinalLevelQuestion,
      FinalLevelAnswerOption,
    ]),
  ],
  controllers: [LevelsController],
  providers: [LevelsService, GoldenLevelsService, FinalLevelsService],
  exports: [LevelsService, GoldenLevelsService, FinalLevelsService],
})
export class LevelsModule {}

