/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { GameService } from './game/game.service';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const gameService = app.get(GameService);
  setInterval(async () => {
    let gameId: number;
    try {
      gameId = await gameService.startGame();
      delay(30_000);
      await gameService.scoreGame(gameId);
      await gameService.endGame(gameId);
    } catch (err) {
      Logger.error(err);
      await gameService.failGame(gameId);
    }
  }, 35_000);

  await app.listen(port);
  Logger.log(
    `🚀 Game-engine service is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
