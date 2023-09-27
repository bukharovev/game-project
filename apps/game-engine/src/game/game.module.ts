import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bet } from './entities/bet.entity';
import { Game } from './entities/game.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameResult } from './entities/game-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, Bet, GameResult]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
