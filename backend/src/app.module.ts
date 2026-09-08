import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ParticipantsModule } from './modules/participants/participants.module';
import { GroupsModule } from './modules/groups/groups.module';
import { WorldsModule } from './modules/worlds/worlds.module';
import { LevelsModule } from './modules/levels/levels.module';
import { MissionsModule } from './modules/missions/missions.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MediaModule } from './modules/media/media.module';
import { AppConfigModule } from './modules/config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USERNAME', 'farmatour5'),
        password: cfg.get('DB_PASSWORD', 'farmatour5pass'),
        database: cfg.get('DB_NAME', 'farmatour5'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: cfg.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    ParticipantsModule,
    GroupsModule,
    WorldsModule,
    LevelsModule,
    MissionsModule,
    QuestionsModule,
    ProgressModule,
    ReportsModule,
    MediaModule,
    AppConfigModule,
  ],
})
export class AppModule {}
