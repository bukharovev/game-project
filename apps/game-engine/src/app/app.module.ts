import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from '../configs/typeorm.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    GameModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
